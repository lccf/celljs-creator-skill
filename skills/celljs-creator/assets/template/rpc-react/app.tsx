import React, { useEffect, useState } from 'react';
import { RpcUtil } from '@celljs/rpc/lib/common';
import { WelcomeServer } from '../common/welcome-protocol';

export const App = () => {
  const [message, setMessage] = useState('Loading');
  
  useEffect(() => {
    const welcomeServer = RpcUtil.get<WelcomeServer>(WelcomeServer);
    welcomeServer.say().then((msg: string) => setMessage(msg));
  }, []);

  return (<h1>{ message }</h1>);
}
