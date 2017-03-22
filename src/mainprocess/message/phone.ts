export class Phone {
  online: boolean = false;
  address: string;
  family: string;
  udpPort: number = 4556; // default phone udp port
  tcpPort: number = 6852; // default phone tcp port
  accessToken: string; // use this token to push/pull data from phone
  authToken: string; // use this token to authenticate request from phone
}