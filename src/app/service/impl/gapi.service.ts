import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { GoogleApiServiceIf, LoginStatus } from '../gapi.service.interface';
import { environment } from '../../../environments/environment';

declare var gapi: any;

@Injectable()
export class GoogleApiServiceImpl implements GoogleApiServiceIf {

    // Array of API discovery doc URLs for APIs used by the quickstart
    private DISCOVERY_DOCS = ['https://script.googleapis.com/$discovery/rest?version=v1'];

    private onStatusChangeEvent: EventEmitter<LoginStatus> = new EventEmitter();

    private retryCount = 0;

    constructor(private zone: NgZone) {

    }

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    public loadClient(): EventEmitter<LoginStatus> {
        if (typeof gapi !== 'undefined') {
            gapi.load('client:auth2', this.initClient.bind(this));
            return this.onStatusChangeEvent;
        }

        console.log('not yet...');
        if (this.retryCount < 10) {
            this.retryCount++;
            setTimeout(() => {
                this.loadClient();
            }, 200 * this.retryCount);
            return this.onStatusChangeEvent;
        }

        console.error('fail to load google api');
        this.onStatusChangeEvent.emit(LoginStatus.FAIL);
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    private initClient() {
        const config = {
            discoveryDocs: this.DISCOVERY_DOCS,
            clientId: environment.clientId,
            scope: environment.scopes.join(' ')
        };
        gapi.client.init(config).then(() => {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(() => this.updateSigninStatus());

            // Handle the initial sign-in state.
            this.updateSigninStatus();
        }).catch((e) => {
            console.error(e);
            this.onStatusChangeEvent.emit(LoginStatus.FAIL);
        });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    private updateSigninStatus() {
        // in listen context, NgZone.isInAngularZone is false.
        this.zone.run(() => {
            const isSignedIn: boolean = gapi.auth2.getAuthInstance().isSignedIn.get();
            // debugger
            if (isSignedIn) {
                this.onStatusChangeEvent.emit(LoginStatus.LOGIN);
            } else {
                this.onStatusChangeEvent.emit(LoginStatus.LOGOUT);
            }
        });
    }

    /**
     *  Sign in the user upon button click.
     */
    public login(): void {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    public logout(): void {
        gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * Load the API and make an API call.  Display the results on the screen.
     */
    public callScriptFunction(remoteFunction: string,
        remoteParameters: any): Observable<any> {
        let subscriber: Subscriber<any> = new Subscriber();

        try {
            const isSignedIn: boolean = gapi.auth2.getAuthInstance().isSignedIn.get();
            if (!isSignedIn) {
                throw new Error('Not logged in');
            }
        } catch (e) {
            throw new Error('Something wrong... Please call loadClient before calling this method.');
        }

        // Call the Execution API run method
        //   'scriptId' is the URL parameter that states what script to run
        //   'resource' describes the run request body (with the function name
        //              to execute)
        gapi.client.script.scripts.run({
            'scriptId': environment.scriptId,
            'resource': {
                'devMode': !!environment.dev,
                'function': remoteFunction,
                'parameters': remoteParameters
            }
        }).then((resp) => {
            // In then statement, it is not in the Angular Zone (NgZone.isInAngularZone is false)
            this.zone.run(() => {
                const result = resp.result;
                if (result.error && result.error.status) {
                    // The API encountered a problem before the script
                    // started executing.
                    subscriber.error('Error calling API:' + JSON.stringify(result, null, 2));
                } else if (result.error) {
                    // The API executed, but the script returned an error.

                    // Extract the first (and only) set of error details.
                    // The values of this object are the script's 'errorMessage' and
                    // 'errorType', and an array of stack trace elements.
                    const error = result.error.details[0];
                    let errorMessage: string;
                    if (error.errorMessage.indexOf('削除された可能性があります') > 0) {
                        errorMessage = '名簿を閲覧する権限がありません';
                    } else {
                        errorMessage = 'Script error message: ' + error.errorMessage;
                    }
                    subscriber.error(errorMessage);
                } else {
                    // The structure of the result will depend upon what the Apps
                    // Script function returns. Here, the function returns an Apps
                    // Script Object with String keys and values, and so the result
                    // is treated as a JavaScript object (folderSet).
                    subscriber.next(result.response.result);
                }
                subscriber.complete();
            });
        }).catch(function (e) {
            const result = e.result;
            if (result && result.error && result.error.code === 404) {
                subscriber.error('サーバーで処理を実行できませんでした。このアカウントに権限が付与されていない可能性があります。');
            } else if (result && result.error && result.error.code >= 500) {
                subscriber.error('サーバーでエラーが発生しました。時間をおいて再度実行してください。');
            }
            console.error(e);
            subscriber.complete();
        });


        return new Observable((s) => { subscriber = s; });

    }
}
