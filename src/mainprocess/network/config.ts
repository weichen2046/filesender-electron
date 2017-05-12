export const config = {
  cmd: {
    // device -> phone
    pc: {
      'cmd_pc_online'                 : 1,
      'cmd_pc_offline'                : 2,
      'cmd_confirm_recv_file'         : 3,
      'cmd_request_auth'              : 4,
      'cmd_sending_file_request'      : 5,
      'cmd_exchange_tcp_port'         : 6,
      'cmd_send_file'                 : 7,
    },
    // phone -> device
    phone: {
      'cmd_phone_online'                  : 1,
      'cmd_phone_offline'                 : 2,
      'cmd_send_file'                     : 3,
      'cmd_sending_file_request'          : 4,
      'cmd_confirm_auth_request'          : 5,
      'cmd_confirm_exchange_tcp_port'     : 6,
      'cmd_confirm_sending_file_request'  : 7,
    }
  },
  tcp: {
    dataVer: 1,
    port: 6852
  },
  udp: {
    dataVer: 1,
    port: 4555
  },
  mobile: {
    default_udp_port: 4556
  }
}
