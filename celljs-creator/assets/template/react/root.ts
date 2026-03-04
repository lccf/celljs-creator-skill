import { Router } from '@celljs/react';
import React from 'react';
import { App } from './app';

const RootComponent = () => {
    return React.createElement(App);
}

@Router(RootComponent)
export default class Root {}
