import { Component, OnInit } from '@angular/core';
import { WalletConnectModal } from '@walletconnect/modal';
import UniversalProvider from '@walletconnect/universal-provider';
import { from, take } from "rxjs";
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

const mythocsCaipId = 'polkadot:f6ee56e9c5277df5b4ce6ae9983ee88f'; // MYTHOS CAIP chain identifier
const chains = [mythocsCaipId];
const methods = ['polkadot_signMessage', 'polkadot_signTransaction'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent implements OnInit {
  private modal: WalletConnectModal;
  public connected: boolean = false;
  public walletAddress: string | null = null;
  public projectId = '1606461775b9832f4b8a788ffb149dc6';
  public provider: UniversalProvider;

  constructor() {
    // Initialize the WalletConnect modal
    this.modal = new WalletConnectModal({
      projectId: this.projectId,
      chains,
      explorerExcludedWalletIds: 'ALL',
      explorerRecommendedWalletIds: [
        '43fd1a0aeb90df53ade012cca36692a46d265f0b99b7561e645af42d752edb92', // Nova wallet ID
      ],
    });
  }

  ngOnInit(): void {
    UniversalProvider.init({
      logger: 'error', // log level
      projectId: this.projectId,
      metadata: {
        name: 'Test',
        description: 'Test',
        url: 'https://test.com/',
        icons: ['https://avatars.githubusercontent.com/u/179229932'],
      },
    }).then((res) => {
      this.provider = res;
      this.initProviderListeners();
      if (this.provider.session) {
        this.walletAddress = this.provider.session?.namespaces['polkadot']?.accounts[0].split(':')[2];
      }
    });
    // You can add additional logic for when the component initializes
  }

  connect() {
    if (this.provider) {
      from(
        this.provider.connect({
          optionalNamespaces: {
            polkadot: {
              methods: methods,
              chains: chains,
              events: ['accountsChanged'],
            },
          },
        }),
      )
        .pipe(
          take(1),
        )
        .subscribe();
    }
  }

  disconnectWallet() {
    this.modal.closeModal(); // Close the modal if still open
    this.connected = false;
    this.walletAddress = null;
    console.log('Wallet disconnected');
  }

  initProviderListeners() {
    this.provider.on('display_uri', (uri: string) => {
      this.modal
        .openModal({
          uri,
        })
        .then();
    });
  }
}
