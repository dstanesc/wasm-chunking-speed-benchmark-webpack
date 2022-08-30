import React, { useEffect, useState, useRef } from 'react';
import './App.css';

import { partReport } from '@dstanesc/fake-metrology-data'
import { chunkyStore } from '@dstanesc/store-chunky-bytes'
import { codec, blockStore, chunkerFactory } from './util.js'

import { pack } from 'msgpackr';
import * as lz4 from 'lz4js'
import * as pako from 'pako'

import { layout, trace } from './plot';

function App() {

  const [b300, setB300] = useState("[300s]");
  const [b600, setB600] = useState("[600s]");
  const [b1200, setB1200] = useState("[1200s]");
  const [b2400, setB2400] = useState("[2400s]");
  const [b4800, setB4800] = useState("[4800s]");
  const [b9600, setB9600] = useState("[9600s]");


  const durations = useRef(new Map())
  const chunkCounts = useRef(new Map())
  const byteSizes = useRef(new Map())
  const TEXT_ENCODER = new TextEncoder()

  const renderCategory = (reportSize, divName) => {
    const traces = []
    durations.current.forEach((value, key) => {
      if (key.startsWith(reportSize.toString())) {
        const what = key.split("-");
        const alg = what[2]; //eg. fastcdc, buzhash
        const lib = what[1]; // eg. json, packr, pako, lz4
        //const count = what[0]; // 300, 600, 1200, etc
        const bytes = byteSizes.current.get(key);
        const count = chunkCounts.current.get(key);
        const duration = value;
        const t = trace({ lib, alg, count, bytes, values: [count, duration], text: [`${alg}, ${lib}`, `${alg}, ${lib}, ${bytes} MiB`] });
        traces.push(t);
      }
    });
    const l1 = layout(`Metrology Report Size - ${reportSize}`);
    Plotly.newPlot(divName, traces, l1);
  }

  const roll = (size) => {
    cleanUp();
    const json = partReport({ reportSize: size });
    const { fastcdc, buzhash } = chunkerFactory({ fastAvgSize: 1024 * 32, buzMask: 15 });
    chunkJson(size, json, fastcdc, 'fastcdc');
    chunkJson(size, json, buzhash, 'buzhash');
    chunkPackr(size, json, fastcdc, 'fastcdc');
    chunkPackr(size, json, buzhash, 'buzhash');
    chunkLz4(size, json, fastcdc, 'fastcdc');
    chunkLz4(size, json, buzhash, 'buzhash');
    renderCategory(size, `plot${size}`);
  }

  const setDone = (size) => {
    setLabel(`[Done]`, size)
  }

  const setRunning = (size) => {
    setLabel(`[...]`, size)
  }

  const perform = async (size) => {
    setRunning(size)
    setTimeout(() => {
      roll(size)
      setDone(size)
    }, 200);
  }

  const setLabel = (label, size) => {
    switch (size) {
      case 300:
        setB300(label)
        break
      case 600:
        setB600(label)
        break
      case 1200:
        setB1200(label)
        break
      case 2400:
        setB2400(label)
        break
      case 4800:
        setB4800(label)
        break
      case 9600:
        setB9600(label)
        break
    }
  }

  const cleanUp = () => {
    durations.current.clear()
    chunkCounts.current.clear()
    byteSizes.current.clear()
  }


  const chunkJson = (size, json, chunk, alg) => {
    const key = size + "-json-" + alg;
    const jsonText = JSON.stringify(json);
    const buf = TEXT_ENCODER.encode(jsonText);
    const d = new Date();
    const startTime = d.getTime();
    const offsets = chunk(buf)
    const d2 = new Date();
    const endTime = d2.getTime();
    const sizeMegaBytes = miB(buf.byteLength);
    byteSizes.current.set(key, sizeMegaBytes);
    chunkCounts.current.set(key, offsets.length);
    durations.current.set(key, (endTime - startTime));
  };

  const chunkPackr = (size, json, chunk, alg) => {
    const key = size + "-packr-" + alg;
    const buf = pack(json)
    const d = new Date();
    const startTime = d.getTime();
    const offsets = chunk(buf)
    const d2 = new Date();
    const endTime = d2.getTime();
    const sizeMegaBytes = miB(buf.byteLength);
    byteSizes.current.set(key, sizeMegaBytes);
    chunkCounts.current.set(key, offsets.length);
    durations.current.set(key, (endTime - startTime));
  };

  const chunkLz4 = (size, json, chunk, alg) => {
    const key = size + "-lz4-" + alg;
    let buf = pack(json)
    buf = lz4.compress(buf);
    const d = new Date();
    const startTime = d.getTime();
    const offsets = chunk(buf)
    const d2 = new Date();
    const endTime = d2.getTime();
    const sizeMegaBytes = miB(buf.byteLength);
    byteSizes.current.set(key, sizeMegaBytes);
    chunkCounts.current.set(key, offsets.length);
    durations.current.set(key, (endTime - startTime));
  };

  const miB = (size) => {
    return (size / (1024 * 1024)).toFixed(2);
  }

  return (
    <div className="App">
      <span className="remote" onClick={() => perform(300)}>{b300}</span>
      <span className="remote" onClick={() => perform(600)}>{b600}</span>
      <span className="remote" onClick={() => perform(1200)}>{b1200}</span>
      <span className="remote" onClick={() => perform(2400)}>{b2400}</span>
      <span className="remote" onClick={() => perform(4800)}>{b4800}</span>
      <span className="remote" onClick={() => perform(9600)}>{b9600}</span>

      <div id='plot300'></div>
      <div id='plot600'></div>
      <div id='plot1200'></div>
      <div id='plot2400'></div>
      <div id='plot4800'></div>
      <div id='plot9600'></div>
    </div>
  );
}

export default App;



