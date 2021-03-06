﻿import { Message } from "./Message";
import * as net from "net";
import { Utils } from "./utils";


export class SocketManager {
    public Id: number=-1;
    private disconnected: boolean = false;
    private serverIp: string;
    socket: net.Socket;
    public OnDisconnect: ((socket: SocketManager) => void)[] = [];
    public onReceive: ((socket: SocketManager, message: Message) => void);
    static counterWidth: number=1000000000000;

    constructor(serverIp: string) {
        this.serverIp = serverIp;
    }

    public StartFromClient(): void {
        this.socket = new net.Socket();
        this.socket.setKeepAlive(true);
        this.socket.connect(1987,
            this.serverIp,
            () => {
                // console.log('Connected');
            });

        let continueBuffer = new Uint8Array(1024 * 1024 * 5);
        let bufferIndex = 0;
        let curPayloadLen: number = -1;
        this.socket.on('data',
            (bytes: Uint8Array) => {
                for (let j = 0; j < bytes.length; j++) {
                    let b = bytes[j];

                    continueBuffer[bufferIndex++] = b;
                    if (curPayloadLen===bufferIndex) {
                        this.onReceive(this, Message.Parse(continueBuffer.slice(0, bufferIndex)));
                        bufferIndex = 0;
                        curPayloadLen = -1;

                    } else if (bufferIndex === 4) {
                        curPayloadLen = Message.ReadBytesInt(continueBuffer, 0);
                    }
                }
            });

        this.socket.on('close',
            () => {
                // console.log('Connection closed');
            });
    }

    public SendMessage(message: Message): boolean {
        if (this.socket.destroyed) {
            this.Disconnect();
            return false;
        }

        try {
            this.socket.write(new Buffer(message.GetBytes()));
        } catch (ex) {
            console.log(`Send exception: ${ex}`);
            this.Disconnect();
            return false;
        }

        return true;
    }


    public ForceDisconnect(): void {
        this.socket.destroy();
        this.Disconnect();
    }

    private Disconnect(): void {
        if (this.disconnected) {
            return;
        }
        this.disconnected = true;
        for (let i = 0; i < this.OnDisconnect.length; i++) {
            this.OnDisconnect[i](this);
        }
    }

}