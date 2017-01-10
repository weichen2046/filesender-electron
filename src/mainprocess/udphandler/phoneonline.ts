export class CmdPhoneOnline {
  public handle(data): boolean {
    let phoneUdpPort = data.readInt32BE();
    console.log(`phone udp listen port: ${phoneUdpPort}`);
    return true;
  }
}
