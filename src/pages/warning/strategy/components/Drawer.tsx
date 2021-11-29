import D3Chart from '@/components/D3Chart';
import DateRangePicker from '@/components/DateRangePicker';
import { ChartComponentProps } from '@/store/chart';
import { Range } from '@/components/DateRangePicker';
import { Metric } from '@/store/warningInterface';
import { AreaChartOutlined } from '@ant-design/icons';
import { Col, Drawer, Radio, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import ResfeshIcon from '@/components/RefreshIcon';
import Resolution from '@/components/Resolution';
import { useTranslation } from 'react-i18next';
interface Props {
  visible: boolean;
  onChange: Function;
  metrics: Metric[];
  yplotline: number;
}
function ChartDrawer(props: Props) {
  const { t, i18n } = useTranslation();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [numPerLine, setNumPerLine] = useState(1);
  const [idents, setIdents] = useState<Array<string>>([]);
  const [range, setRange] = useState<Range>({ start: 0, end: 0 });
  const [step, setStep] = useState<number | null>(null);
  const [chartOption, setChartOption] = useState<ChartComponentProps>({
    range: { start: 0, end: 0 },
    limit: 50,
    metric: '',
    description: '',
  });

  useEffect(() => {
    setMetrics(props.metrics);
  }, [props.metrics]);

  const { visible, onChange } = props;
  const onClose = () => {
    onChange(false);
  };
  const formatOption = (obj = {}, r?: Range) => {
    // 如果是其他参数变化，则不必传r参数，会使用缓存的range
    let newR = r || range;
    setChartOption({ ...chartOption, ...obj, range: newR });
  };
  const handleRefresh = () => {
    formatOption();
  };

  const handleDateChange = (e) => {
    setRange(e);
    formatOption({}, e);
  };
  const placeholder = () => (
    <h2 className='holder'>
      <AreaChartOutlined style={{ fontSize: '30px' }} />
      <span>选择监控指标添加图表</span>
    </h2>
  );
  return (
    <Drawer
      title={t('预览图')}
      placement='right'
      onClose={onClose}
      visible={visible}
      // destroyOnClose={true}
      // getContainer=body
      className={'my-drawer'}
      drawerStyle={{ minWidth: 850 }}
    >
      {/* <div> */}
      <div className='header'>
        <div className='header-left'>
          <DateRangePicker onChange={handleDateChange} />
          <Resolution onChange={(v) => setStep(v)} initialValue={step} />
          <ResfeshIcon onClick={handleRefresh} className='reload-icon' />
        </div>
      </div>
      <div className='chart-list'>
        <Row gutter={15} style={{ width: '100%' }}>
          {metrics.length > 0
            ? metrics.map((metric, i) => {
                return (
                  <Col key={i} span={24 / numPerLine}>
                    <D3Chart
                      options={{
                        ...chartOption,
                        idents: idents.length > 0 ? idents : undefined,
                        step,
                        metric: metric.name,
                        description: metric.description,
                        prome_ql: metric.promql,
                        yplotline:
                          props.yplotline > 0 ? props.yplotline : undefined,
                      }}
                    />
                  </Col>
                );
              })
            : placeholder()}
        </Row>
      </div>
      {/* </div> */}
    </Drawer>
  );
}
export default ChartDrawer;
