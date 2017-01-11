const os = require('os');
const { Netmask } = require('netmask');

export class NetUtils {
  public static getIpV4NetAddresses() {
    let interfaces = os.networkInterfaces();
    let addresses = [];
    for (let k in interfaces) {
      for ( let k2 in interfaces[k]) {
	let addr = interfaces[k][k2];
	if (addr.family === 'IPv4' && !addr.internal) {
	  addresses.push({
	    'address': addr.address,
	    'netmask': addr.netmask
	  });
	}
      }
    }

    return addresses;
  }

  public static getIpV4Netmask(): string|null {
    let addresses = NetUtils.getIpV4NetAddresses();

    return addresses.length > 0 ? addresses[0].netmask : null;
  }

  public static getIpV4IpAddress(): string|null {
    let addresses = NetUtils.getIpV4NetAddresses();

    return addresses.length > 0 ? addresses[0].address : null;
  }

  public static getIpV4BroadcastAddress(): string|null {
    let addresses = NetUtils.getIpV4NetAddresses();
    if (addresses.length <= 0) {
      return null;
    }
    let netmask = new Netmask(`${addresses[0].address}/${addresses[0].netmask}`);
    return netmask.broadcast;
  }
}
