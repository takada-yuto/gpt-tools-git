// tokenState.ts

import { atom } from 'recoil';

export const tokenState = atom({
  key: 'tokenState',
  default: '', // 初期値は空文字列
});
