export interface IPhone {
  serialno: string;
  islocal: boolean;
  state: string;
  online: boolean;
  address: string;
  nickname: string;
  family: string;
  udpPort: number; // default phone udp port
  tcpPort: number; // default phone tcp port
  accessToken: string; // use this token to push/pull data from phone
  authToken: string; // use this token to authenticate request from phone
}