import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { PromQLExtension } from 'codemirror-promql';
import { basicSetup } from '@codemirror/basic-setup';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { baseTheme } from './CMTheme';
interface Props {
  style?: object;
  className?: string;
  value?: string;
  xCluster: string;
  editable?: boolean;
  onChange?: (expr: string) => void;
}

export default function PromqlEditor(props: Props) {
  const { onChange, value, className, style = {}, editable = true, xCluster } = props;
  const [view, setView] = useState<EditorView>();
  const containerRef = useRef<HTMLDivElement>(null);
  const url = '/api/n9e/prometheus';

  function myHTTPClient(resource: string): Promise<Response> {
    return fetch(resource, {
      method: 'Get',
      headers: new Headers({
        'X-Cluster': xCluster,
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      }),
    });
  }
  const promQL = new PromQLExtension().setComplete({
    remote: { fetchFn: myHTTPClient, url },
    // remote: { url: 'http://10.86.76.13:8090' },
  });
  useEffect(() => {
    const v = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          baseTheme,
          basicSetup,
          promQL.asExtension(),
          EditorView.updateListener.of((update: ViewUpdate): void => {
            onChange?.(update.state.doc.toString());
          }),
          EditorView.editable.of(editable),
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // tslint:disable-next-line:no-non-null-assertion
      parent: containerRef.current!,
    });
    setView(v);
  }, []);

  return <div ref={containerRef} className={className} style={Object.assign({ fontSize: 12 }, style)}></div>;
}
