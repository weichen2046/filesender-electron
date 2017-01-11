export const config = {
  cmd: {
    // pc -> phone
    pc: {
      'cmd_pc_online'     : 1,
      'cmd_pc_offline'    : 2
    },
    // phone -> pc
    phone: {
      'cmd_phone_online'  :1,
      'cmd_phone_offline' :2,
      'cmd_send_file'     :3
    }
  },
  tcp: {
    dataVer: 1,
    port: 6852
  },
  udp: {
    dataVer: 1,
    port: 4555
  }
}
