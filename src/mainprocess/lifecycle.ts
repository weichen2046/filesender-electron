import { NetworkServerCallback } from './networkservercallback';

export class LifeCycleHooks implements NetworkServerCallback {
  private startedServerCount: number = 0;

  public constructor(private readonly serverCount: number) {
  }

  public onAppStart() {
    console.log('lifecycle onAppStart');
  }

  public onNetworkServersStarted() {
    console.log('lifecycle onNetworkServersStarted');
  }

  public onNetworkServersStopped() {
    console.log('lifecycle onNetworkServersStopped');
  }

  // onAppQuit() may comes after onNetworkServersStopped()
  public onAppQuit() {
    console.log('lifecycle onAppQuit');
  }

  // overrides

  public onServerStarted() {
    this.startedServerCount += 1;
    if (this.startedServerCount == this.serverCount) {
      this.onNetworkServersStarted();
    }
  }

  public onServerStopped() {
    this.startedServerCount -= 1;
    if (this.startedServerCount == 0) {
      this.onNetworkServersStopped();
    }
  }
}
