export class Phone {
  serialno: string;
  islocal: boolean = false;
  state: string;
  online: boolean = false;
  address: string;
  nickname: string;
  family: string;
  udpPort: number = 4556; // default phone udp port
  tcpPort: number = 6852; // default phone tcp port
  accessToken: string; // use this token to push/pull data from phone
  authToken: string; // use this token to authenticate request from phone
}