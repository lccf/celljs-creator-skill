---
name: celljs-creator
description: 创建celljs项目
---

# Celljs Creator

## 创建celljs项目

### 确定celljs版本
- 如果不指定则默认为latest
- 拷贝 assets/template/package.json 文件到根目录，keywords 字段必须包含 cell-component

### 生成前后端代码
- 前端和后端都未指定则默认项目为后端mvc
- 处理依赖时区分 dependencies 和 devDependencies
- 指定后端
  - 后端目录默认为 `src/node`，如果目录不存在则自动创建
  - 将 assets/template/celljs-refrences.md 复制到 docs 目录，如果目录不存则自动创建
  - 如果指定后端为mvc
    - 将 assets/template/mvc-node 目录的文件拷贝至后端目录，
    - 同时创建 src/assets 目录，复制 assets/template/mvc-assets 内容到 src/assets
    - package.json 中 dependencies 添加 @celljs/mvc、@celljs/express-adapter 依赖
  - 如果指定后端为api
    - 将 assets/template/api-node 目录的文件拷贝至后端目录
    - package.json 中 dependencies 添加 @celljs/mvc、@celljs/express-adapter 依赖
  - 如果指定后端为rpc
    - 将 assets/template/rpc-node 目录的文件拷贝至后端目录
    - 创建 src/common目录，将 assets/template/common 目录中的文件拷贝至 src/common
    - package.json 中 dependencies 添加 @celljs/rpc 依赖
- 指定前端
  - 前端目录默认为 src/browser，如果目录不存在则自动创建
  - 如果指定前端为react
    - 如果未指定后端，将 assets/template/react 目录的文件拷贝至前端目录
    - 如果后端模式为 api，将 assets/template/api-react 目录的文件拷贝至前端目录
    - 如果后端模式为 rpc，将 assets/template/rpc-react 目录的文件拷贝至前端目录
    - package.json 中 dependencies 添加 @celljs/react，devDependencies 添加 @celljs/serve-static 依赖
  - 如果指定前端为vue
    - 如果未指定后端，将 assets/template/vue 目录的文件拷贝至前端目录
    - 如果后端模式为 api，将 assets/template/api-vue 目录的文件拷贝至前端目录
    - 如果后端模式为 rpc，将 assets/template/rpc-vue 目录的文件拷贝至前端目录
    - package.json 中 dependencies 添加 @celljs/vue，devDependencies 添加 @celljs/serve-static 依赖

### 生成项目配置
- 创建src/hooks/webpack.ts文件，默认内容如下：
```typescript
import * as path from 'path';
import { WebpackContext, ConfigurationContext } from '@celljs/cli-service';

export default async (context: WebpackContext) => {
  const { configurations, dev } = context;
  const basePath = path.resolve(__dirname, '../');
  // frontend-config

  // backend-config
}
```
- 如果项目包含前端时，src/hooks/webpack.ts文件中的 `// frontend-config` 下方插入以下内容：
```typescript
  const webpackConfig = ConfigurationContext.getFrontendConfiguration( configurations );
  if (webpackConfig) {
    // 仅在开发模式执行
    // if (dev) {
    //   webpackConfig?.devServer
    //     .historyApiFallback(true);
    // }
    // 设置路径
    webpackConfig?.resolve
      .alias
        .set('@', basePath+'/browser/')
        .set('~', basePath);
  }
```
- 如果项目包含后端时，src/hooks/webpack.ts文件中的 `// backend-config` 下方插入以下内容：
```typescript
  const backendConfig = ConfigurationContext.getBackendConfiguration( configurations );
  if (backendConfig) {
    backendConfig?.resolve
      .alias
        .set('~', basePath);
  }
```
- 项目根目录创建 tsconfig.json
  - 如果前端为vue，将 assets/template/vue-tsconfig.json 中的内容拷贝至 tsconfig.json
  - 如果不包含前端或前端不为vue，将 assets/template/react-tsconfig.json 中的内容拷贝至 tsconfig.json
- 项目根目录创建 cell.yml
- 当项目包含后端时，cell.yml 包含以下内容：
```yaml
# 后端项目配置
backend:
  modules:
    - <backend-path>/module
```
  - 替换 cell.yml 中的 <backend-path> 为后端目录
- 当项目包含前端时，cell.yml 包含以下内容：
```yaml
# 前端项目配置内容
frontend:
  modules:
    - <frontend-path>/module
  webpack:
    htmlWebpackPlugin:
      base:
        href: /

cell:
  hostDomId: root
  name: <project-name>
```
  - 替换 cell.yml 中的 <frontend-path> 为前端目录
  - 替换 cell.yml 中的 <project-name> 为项目名称
- 项目根目录创建cell-local.yml默认为空，当项目同时包含前端和后端时内容如下：
```yaml
cell:
  server:
    path: /api/
  serve-static:
    apiPath: /api/*
```

### 安装依赖
- 替换 package.json 中的 <project-name> 为项目名称
- 替换 package.json 中 <celljs-version> 为celljs版本
- 提示用户是否安装依赖
  - 如果用户选择安装，执行 yarn install
  - 如果用户选择不安装，提示用户稍后手动安装依赖
- 提示用户项目创建完成
