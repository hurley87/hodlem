'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function Connect() {
  const { login, user } = usePrivy();

  console.log('user', user);

  return (
    <div>
      <button onClick={login}>Connect</button>
    </div>
  );
}
