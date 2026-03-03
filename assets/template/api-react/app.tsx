import { ContainerUtil } from '@celljs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HomeService } from './service';

export const App = () => {
  const homeService = useMemo(() => {
    return ContainerUtil.get<HomeService>(HomeService);
  }, []);

  const [message, setMessage] = useState('Loading');
  useEffect(() => {
    homeService.main().then((res) => {
      setMessage(res);
    });
  }, []);

  const fetchTestData = useCallback(() => {
    homeService.test().then(res => alert(res.data));
  }, []);

  return (<div>
    <h1>{ message }</h1>
    <button onClick={ fetchTestData }>fetch test</button>
  </div>);
}
