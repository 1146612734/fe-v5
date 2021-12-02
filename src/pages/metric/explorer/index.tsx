import PageLayout from '@/components/pageLayout';
import { LineChartOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';
import { generateID } from '@/utils';
import { getMetrics } from '@/services/warning';
import Panel from './panel';

type PanelMeta = { id: string; defaultPromQL?: string };

interface PanelListProps {
  metrics: string[];
}

function getUrlParamsByName(name) {
  let reg = new RegExp(`(?<=\\b${name}=)[^&]*`),
    str = location.search || '',
    target = str.match(reg);
  if (target) {
    return target[0];
  }
  return '';
}

const PanelList: React.FC<PanelListProps> = ({ metrics }) => {
  const [panelList, setPanelList] = useState<PanelMeta[]>([{ id: generateID(), defaultPromQL: decodeURIComponent(getUrlParamsByName('promql')) }]);
  // 添加一个查询面板
  function addPanel() {
    setPanelList((a) => [
      ...panelList,
      {
        id: generateID(),
      },
    ]);
  }

  // 删除指定查询面板
  function removePanel(id) {
    setPanelList(panelList.reduce<PanelMeta[]>((acc, panel) => (panel.id !== id ? [...acc, { ...panel }] : acc), []));
  }

  return (
    <>
      {panelList.map(({ id, defaultPromQL = '' }) => (
        <Panel key={id} metrics={metrics} defaultPromQL={defaultPromQL} removePanel={() => removePanel(id)} />
      ))}
      <div className='add-prometheus-panel'>
        <Button size='large' onClick={addPanel}>
          <PlusOutlined />
          新增一个查询面板
        </Button>
      </div>
    </>
  );
};

const MetricExplorerPage: React.FC = () => {
  const [metrics, setMetrics] = useState<string[]>([]);

  useEffect(() => {
    getMetrics().then((res) => {
      setMetrics(res.data || []);
    });
  }, []);

  return (
    <PageLayout title='即时查询' icon={<LineChartOutlined />}>
      <div className='prometheus-page'>
        <PanelList metrics={metrics} />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
