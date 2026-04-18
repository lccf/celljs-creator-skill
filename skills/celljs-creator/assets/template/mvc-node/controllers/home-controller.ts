import { Controller, Get, Html } from '@celljs/mvc/lib/node';

@Controller('')
export class HomeController {
    @Get('/')
    @Html('home/index.mustache')
    index() {
        return {
            title: 'Welcome to Cell',
            message: 'Welcome to Cell'
        }
    }
}
