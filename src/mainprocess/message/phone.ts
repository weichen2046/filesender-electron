import { IPhone } from "mainprocess/message/iphone";

export class Phone implements IPhone {
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

  public isAuthenticated(): boolean {
    return this.accessToken ? true : false;
  }

  public static parseFrom(_phone: IPhone): Phone {
    let phone = new Phone();
    phone.serialno = _phone.serialno;
    phone.islocal = _phone.islocal;
    phone.state = _phone.state;
    phone.online = _phone.online;
    phone.address = _phone.address;
    phone.nickname = _phone.nickname;
    phone.family = _phone.family;
    phone.udpPort = _phone.udpPort;
    phone.tcpPort = _phone.tcpPort;
    phone.accessToken = _phone.accessToken;
    phone.authToken = _phone.authToken;
    return phone;
  }
}