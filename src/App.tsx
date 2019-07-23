/// <reference path="./localtypings/extension.d.ts" />

import * as React from 'react';

import './css/index.css'

import { pxt, PXTClient } from '../lib/pxtextensions';

import { Map } from './components/Map';
import { Navigator } from './components/Navigator';
import { EditingTools } from './components/EditingTools';
import { Toolbox } from './components/Toolbox';

import { EmitterFactory } from "./exporter/factory";
import { MapData } from './map';

import { MapTools, loadImageAsync } from './util';
import { TileSet, TILE_SIZE } from './tileset';


export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
    tileSetLoaded: boolean;
    target: string;
}

export class App extends React.Component<AppProps, AppState> {

    protected map: MapData;
    protected tileSet: TileSet;
    constructor(props: AppProps) {
        super(props);

        this.state = {
            tileSetLoaded: false,
            target: props.target
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        loadImageAsync("./tile.png")
            .then(el => {
                this.tileSet = new TileSet(el, TILE_SIZE);
                this.setState({tileSetLoaded: true})
            });

        this.map = new MapData();
        props.client.on('read', this.deserialize);
        props.client.on('hidden', this.serialize);
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (resp && resp.json && resp.json.length > 0) {
            const code = resp.code;
            const json = JSON.parse(resp.json);
            console.log('reading code and json', code, json);
        }
    }

    private serialize() {
        // PXT allows us to write to files in the project [extension_name].ts and [extension_name].json
        console.log("write code and json");

        const { target } = this.state;
        const emitter = EmitterFactory.getEmitter(target);
        if (!emitter) return;

        const code = emitter.output(undefined);
        const json = {};
        pxt.extensions.write(code, JSON.stringify(json));
    }

    render() {
        const { target } = this.state;
        return (
            <div className="app">
                <div className="sidebar">
                    <Navigator map={this.map} tileSet={this.tileSet}/>
                    <EditingTools />
                    <Toolbox />
                </div>
                <div className="main">
                    <Map tool={MapTools.Stamp} map={this.map} tileSet={this.tileSet}/>
                </div>
            </div>
        );
    }
}
