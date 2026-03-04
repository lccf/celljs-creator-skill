import { Controller, Get, Json, Post, Text } from '@celljs/mvc/lib/node';

@Controller('home')
export class HomeController {
    @Get('')
    @Text()
    home(): string {
        return 'Welcome to Cell';
    }

    @Post('test')
    @Json()
    test() {
        return {
            data: 'test response'
        };
    }
}
