# 添加数据库支持

添加数据库支持分为以下几个步骤

1. 确定数据库类型 mysql 或 sqlite
2. 安装依赖 @celljs/typeorm，如果是数据类型是 sqlite 还需要安装 sqlite3 依赖
3. 在 cell-local.yml 中添加数据库配置
  - 如果是 mysql 则配置如下：
```yaml
backend:
  cell:
    typeorm:
      ormConfig:
        - type: mysql
          host: localhost
          port: 3306
          username: root
          password: <PASSWORD>
          database: celljs
          synchronize: true
          logging: true
```
  - 如果是 sqlite 则配置如下：
```yaml
backend:
  cell:
    typeorm:
      ormConfig:
        - type: sqlite
          database: ./db/celljs.db
          synchronize: true
          logging: true
```

# 创建数据库实体

1. 根据表定义创建实体定义，示例如下：

```typescript
// src/node/entity/content.ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity({ name: 'contents' })
@Unique(['title'])
export class Content extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
```

2. 导出实体

```typescript
// src/node/entity/index.ts
export * from './content';
```

3. 在 `src/node/module.ts` 中添加以下代码绑定实体

```typescript
import * as entities from './entity';
import { autoBindEntities } from '@celljs/typeorm';

autoBindEntities(entities);
```

# 创建控制器访问数据库

1. 添加 controller

```typescript
// src/node/controllers/content-controller.ts
import { Controller, Get, Param, Delete, Put, Post, Body } from '@celljs/mvc/lib/node';
import { Transactional, OrmContext } from '@celljs/typeorm/lib/node';
import { Content } from '../entity';

@Controller('contents')
export class ContentController {
  @Get()
  @Transactional({ readOnly: true })
  list(): Promise<Content[]> {
    const repo = OrmContext.getRepository(Content);
    return repo.find();
  }

  @Get(':id')
  @Transactional({ readOnly: true })
  get(@Param('id') id: number): Promise<Content | null> {
    const repo = OrmContext.getRepository(Content);
    return repo.findOne(id);
  }

  @Delete(':id')
  @Transactional()
  async remove(@Param('id') id: number): Promise<void> {
    const repo = OrmContext.getRepository(Content);
    await repo.delete(id);
  }

  @Put()
  @Transactional()
  async modify(@Body() content: any): Promise<void> {
    const repo = OrmContext.getRepository(Content);
    await repo.update(content.id, content);
  }

  @Post()
  @Transactional()
  create(@Body() content: any): Promise<Content> {
    const repo = OrmContext.getRepository(Content);
    return repo.save(content);
  }
}
```

2. 在 `src/node/module.ts` 中添加以下代码导入控制器绑定

```typescript
import './controllers/content-controller';
```

# 添加用户认证

1. 添加依赖

```bash
yarn add @celljs/security @celljs/jwt crypto-js
yarn add --dev @types/crypto-js
```

修改 `cell-local.yml` 添加如下内容：

```yml
backend:
  cell:
    # 新增内容
    logger:
      level: debug
    jwt:
      secret: abcdefg
```

2. 添加工具函数

创建 `src/node/utils/crypto.ts` 内容如下：

```ts
import SHA256 from "crypto-js/sha256";

export function sha256Encode(content: string) {
    return SHA256(content).toString();
}
```

创建 `src/common/data/response-data.ts` 内容如下：

```ts
export interface ResponseData<T> {
    code: 0 | 1,
    data: T | null,
    message: string
}
```

创建 `src/node/utils/index.ts` 内容如下：

```ts
import { ResponseData } from "../../common";

export const jsonFormat = <T>(data: T, error: any = null) : ResponseData<T> => {
    let code: 0 | 1 = error ? 1 : 0;
    let message: string = error ? (error.message || error) : '';
    return { code, data, message };
}
```

3. 添加用户实体

创建 `src/node/entity/user.ts` 文件定义用户实体，内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, Unique } from "typeorm";

@Entity({ name: "users" })
@Unique(["username"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
```

修改 `src/node/entity/index.ts` 导出实体，添加内容如下:

```ts
export * from "./user";
```

4. 添加用户载入功能

创建`src/node/services/user-service.ts`文件处理用户加载，内容如下：

```ts
import { Service } from "@celljs/core";
import { UserService } from "@celljs/security/lib/node";
import { User } from "../entity/user";

@Service({ id: UserService, rebind: true })
export class UserServiceImpl implements UserService<string, any> {
    async load(username: string): Promise<any> {
        let user = await User.findOne({ where: { username: username } });
        return user;
    }
}
```

默认 [user-service](https://github.com/cellbang/cell/blob/main/packages/security/src/node/user/user-service.ts) 实现

创建 `src/node/services/index.ts` 文件导出，内容如下：

```ts
export * from "./user-service";
```

5. 添加认证模块

创建`src/node/authentication/user-checker.ts`文件处理用户检测，内容如下：

```ts
import { Service } from "@celljs/core";
import { UserChecker, UsernameNotFoundError } from "@celljs/security/lib/node";

@Service({id: UserChecker, rebind: true})
export class UserCheckerImpl implements UserChecker {
    
    async check(user: any): Promise<void> {
        if (!user || !user.username) {
            throw new UsernameNotFoundError("User account not found");
        }
    }
}
```

创建`src/node/authentication/password-encoder.ts`文件处理密码比较，内容如下：

```ts
import { Service } from "@celljs/core";
import { PasswordEncoder } from "@celljs/security/lib/node";
import { sha256Encode } from "../utils/crypto";

@Service({ id: PasswordEncoder, rebind: true })
export class PasswordEncoderImpl implements PasswordEncoder {
    async encode(content: string): Promise<string> {
        return sha256Encode(content);
    }

    async matches(content: string, encoded: string): Promise<boolean> {
        let encodedContent = await this.encode(content);
        return encodedContent === encoded;
    }
}
```

默认 [password-encoder](https://github.com/cellbang/cell/blob/main/packages/security/src/node/crypto/password/password-encoder.ts) 实现

创建`src/node/authentication/authentication-success-handler.ts`文件登录成功时返回 token ，内容如下：

```typescript
import { Component, Autowired } from "@celljs/core";
import { Context } from "@celljs/web/lib/node";
import { AuthenticationSuccessHandler, Authentication } from "@celljs/security/lib/node";
import { JwtService } from "@celljs/jwt";
import { jsonFormat } from "../utils";

@Component({ id: AuthenticationSuccessHandler, rebind: true })
export class AuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {
    @Autowired(JwtService)
    jwtService: JwtService;

    async onAuthenticationSuccess(authentication: Authentication): Promise<void> {
        const response = Context.getResponse();
        let token = await this.jwtService.sign({ username: authentication.name });
        response.body = JSON.stringify(jsonFormat({ token }));
    }
}
```

默认 [authentication-success-handler](https://github.com/cellbang/cell/blob/main/packages/security/src/node/authentication/authentication-success-handler.ts) 实现

创建`src/node/authentication/security-context-store.ts`处理 header 带 Token 的请求，内容如下：

```typescript
import { Autowired, Component, Value } from "@celljs/core";
import { User } from "@celljs/security";
import { SecurityContext, SecurityContextStore, SecurityContextStrategy, UserMapper, UserService } from "@celljs/security/lib/node";
import { Context } from "@celljs/web/lib/node";
import { JwtService } from "@celljs/jwt";

@Component({ id: SecurityContextStore, rebind: true })
export class SecurityContextStoreImpl implements SecurityContextStore {
    @Value("cell.security")
    protected readonly options: any;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired(SecurityContextStrategy)
    protected readonly securityContextStrategy: SecurityContextStrategy;
    
    @Autowired(UserMapper)
    protected readonly userMapper: UserMapper;

    @Autowired(JwtService)
    jwtService: JwtService;

    async load(): Promise<any> {
        const request = Context.getRequest();
        const token = (request.get("Token") || "").trim()
        const securityContext = await this.securityContextStrategy.create();
        if (token) {
            const userInfo: any = await this.jwtService.verify(token);
            const user = await this.userService.load(userInfo.username);
            if (user) {
                await this.userMapper.map(user);
                securityContext.authentication = {
                    name: user.username,
                    principal: user,
                    credentials: "",
                    policies: user.policies,
                    authenticated: true
                };
            }
            
        }
        return securityContext;
    }

    async save(context: SecurityContext): Promise<void> {
    }
}
```

创建 `src/node/authentication/error-handler.ts` 添加认证错误处理，内容如下：

```ts
import { Autowired, Component, Value } from "@celljs/core";
import { Context, ErrorHandler, RedirectStrategy } from "@celljs/web/lib/node";
import { AUTHENTICATION_ERROR_HANDLER_PRIORITY, AuthenticationError, RequestCache } from "@celljs/security/lib/node";
import { jsonFormat } from "../utils";

@Component(ErrorHandler)
export class AuthenticationErrorHandler implements ErrorHandler {
    readonly priority: number = AUTHENTICATION_ERROR_HANDLER_PRIORITY + 100;

    @Value("cell.security.basic.realm")
    protected realm: string;

    @Value("cell.security.basic.enabled")
    protected readonly baseEnabled: boolean;

    @Value("cell.security.loginPage")
    protected loginPage: string;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(RequestCache)
    protected readonly requestCache: RequestCache;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        let isAuthError = err instanceof AuthenticationError;
        return Promise.resolve(isAuthError);
    }
    async handle(ctx: Context, err: AuthenticationError): Promise<void> {
        await this.requestCache.save();
        ctx.response.end(JSON.stringify(jsonFormat(null, err)));
    }
}
```

默认 [AuthenticationErrorHandler](https://github.com/cellbang/cell/blob/main/packages/security/src/node/error/error-handler.ts) 实现

创建 `src/node/authentication/index.ts` 引入认证文件，内容如下：

```ts
export * from "./password-encoder";
export * from "./user-checker";
export * from "./authentication-success-handler";
export * from "./security-context-store";
export * from "./error-handler";
```

修改 `src/node/module.ts` 引入认证文件，内容如下：

```ts
import { autoBind } from "@celljs/core";
import "./controllers";
import { autoBindEntities } from "@celljs/typeorm";
import * as entities from "./entity";
import "./authentication";
import "./services";

autoBindEntities(entities);
export default autoBind();
```

6. 给控制器添加认证

从 @celljs/security/lib/node 导入 Authenticated 修饰器，给需要认证的方法添加修饰
