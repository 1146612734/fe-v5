import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactElement,
} from 'react';
import { Button, Collapse, Modal, Menu, Dropdown, Divider } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
const { Panel } = Collapse;
import _ from 'lodash';
import { Group, ChartConfig } from '@/store/dashboardInterface';
import { Tag } from '@/store/chart';
import { getCharts, updateCharts } from '@/services/dashboard';
import D3Chart from '@/components/D3Chart';
import { SettingOutlined, LinkOutlined, DownOutlined } from '@ant-design/icons';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Range } from '@/components/DateRangePicker';
import { TagFilterResponse } from './VariableConfig/definition';
import { number } from 'echarts';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;
interface Props {
  groupInfo: Group;
  range: Range;
  step: number;
  variableConfig: TagFilterResponse | null;
  onAddChart: (data: number) => void;
  onUpdateChart: (group: Group, data: Chart) => void;
  onDelChart: (group: Group, data: Chart) => void;
  onDelChartGroup: (id: number) => void;
  onUpdateChartGroup: (group: Group) => void;
  onMoveUpChartGroup: (group: Group) => void;
  onMoveDownChartGroup: (group: Group) => void;
}
type Layouts = {
  lg: Array<Layout>;
  sm: Array<Layout>;
  md: Array<Layout>;
  xs: Array<Layout>;
  xxs: Array<Layout>;
};
type Layout = {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
};
const unit = 6;
const cols = 24;
const defColItem = 4; //一键规整列数

export interface Chart {
  id: number;
  configs: ChartConfig;
  weight: number;
}
const layouts: Layouts = {
  lg: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  sm: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  md: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  xs: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  xxs: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
}; // 根据chartConfigModal配置的数据进行展示

export default function ChartGroup(props: Props) {
  const { t } = useTranslation();
  const {
    groupInfo,
    range,
    step,
    variableConfig,
    onAddChart,
    onUpdateChart,
    onDelChartGroup,
    onDelChart,
    onUpdateChartGroup,
    onMoveUpChartGroup,
    onMoveDownChartGroup,
  } = props;
  const [chartConfigs, setChartConfigs] = useState<Chart[]>([]);
  const [layout, setLayout] = useState<Layouts>(layouts); // const [colItem, setColItem] = useState<number>(defColItem);

  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    init();
  }, [groupInfo.updateTime]);

  const init = () => {
    setMounted(false);
    getCharts(groupInfo.id).then((res) => {
      let charts = res.dat
        ? res.dat.map((item: { configs: string; id: any; weight: any }) => {
            let configs = item.configs ? JSON.parse(item.configs) : {};
            return {
              id: item.id,
              configs,
              weight: item.weight,
            };
          })
        : [];
      const realChart = charts.filter(
        (item: {
          configs: {
            metric: any;
            prome_ql: any;
          };
        }) => {
          return item.configs.metric || item.configs.prome_ql;
        },
      );
      const innerLayout = realChart.map(
        (
          item: {
            configs: {
              layout: {
                i: string;
              };
            };
          },
          index: string | number,
        ) => {
          if (item.configs.layout) {
            // 当Chart被删除后 layout中的i会中断，ResponsiveReactGridLayout会有问题
            item.configs.layout.i = '' + index;
            return item.configs.layout;
          } else {
            return getNewItemLayout(
              realChart.slice(0, index).map(
                (item: {
                  configs: {
                    layout: any;
                  };
                }) => item.configs.layout,
              ),
              Number(index),
            ); // return {
            //   x: 0,
            //   y: 0,
            //   w: unit,
            //   h: unit / 2,
            //   i: '' + index,
            // };
          }
        },
      );
      const realLayout: Layouts = {
        lg: innerLayout,
        sm: innerLayout,
        md: innerLayout,
        xs: innerLayout,
        xxs: innerLayout,
      };
      setLayout(realLayout);
      setChartConfigs(realChart);
      setMounted(true);
    });
  };

  const getNewItemLayout = function (
    curentLayouts: Array<Layout>,
    index: number,
  ): Layout {
    const w = unit;
    const h = unit / 3;
    const layoutArrayLayoutFillArray = new Array<Array<number>>();
    curentLayouts.forEach((layoutItem) => {
      if (layoutItem) {
        const { w, h, x, y } = layoutItem;

        for (let i = 0; i < h; i++) {
          if (typeof layoutArrayLayoutFillArray[i + y] === 'undefined') {
            layoutArrayLayoutFillArray[i + y] = new Array<number>(cols).fill(0);
          }

          for (let k = 0; k < w; k++) {
            layoutArrayLayoutFillArray[i + y][k + x] = 1;
          }
        }
      }
    });
    let nextLayoutX = -1;
    let nextLayoutY = -1; // 填充空行

    for (let i = 0; i < layoutArrayLayoutFillArray.length; i++) {
      if (typeof layoutArrayLayoutFillArray[i] === 'undefined') {
        layoutArrayLayoutFillArray[i] = new Array<number>(cols).fill(0);
      }
    }

    function isEmpty(i: number, j: number) {
      let flag = true;

      for (let x = i; x < i + w; x++) {
        for (let y = j; y < j + h; y++) {
          if (
            layoutArrayLayoutFillArray[x] &&
            layoutArrayLayoutFillArray[x][y]
          ) {
            flag = false;
          }
        }
      }

      return flag;
    }

    for (let i = 0; i < layoutArrayLayoutFillArray.length - 1; i++) {
      for (let j = 0; j <= cols - unit; j++) {
        if (isEmpty(i, j)) {
          nextLayoutY = i;
          nextLayoutX = j;
          break;
        }
      }
    }

    if (nextLayoutX === -1) {
      nextLayoutX = 0;
      nextLayoutY = layoutArrayLayoutFillArray.length;
    }

    return {
      w,
      h,
      x: nextLayoutX,
      y: nextLayoutY,
      i: '' + index,
    };
  };

  const onLayoutChange = async (
    layout: {
      h: any;
      w: any;
      x: any;
      y: any;
      i: any;
    }[],
  ) => {
    let currConfigs = chartConfigs.map((item, index) => {
      const { h, w, x, y, i } = layout[index];
      item.configs.layout = {
        h,
        w,
        x,
        y,
        i,
      };
      return item;
    }); // setLayout({ lg: [...layout] });

    updateCharts(currConfigs);
  };

  const setArrange = (colItem: number, w = cols / colItem, h = unit / 3) => {
    // setMounted(false);
    let countX = 0;
    let countY = 0;
    const _lg: Layout[] = [];
    [...layout.lg].forEach((ele, index) => {
      let innerObj = { ...ele };

      if (index + 1 > colItem) {
        let c = (index + 1) / colItem;
        countY = Math.trunc(c) * h;
      }

      innerObj.w = w;
      innerObj.h = h;
      innerObj.x = countX;
      innerObj.y = countY;
      countX += innerObj.w;

      if ((index + 1) % colItem === 0) {
        countX = 0;
      }

      _lg.push(innerObj);
    });
    let currConfigs = chartConfigs.map((item, index) => {
      const { h, w, x, y, i } = _lg[index];
      item.configs.layout = {
        h,
        w,
        x,
        y,
        i,
      };
      return item;
    });
    updateCharts(currConfigs);
    setLayout({
      lg: [..._lg],
      sm: [..._lg],
      md: [..._lg],
      xs: [..._lg],
      xxs: [..._lg],
    });
    setChartConfigs(currConfigs); // setMounted(true);

    groupInfo.updateTime = Date.now();
  };

  function handleMenuClick(e) {
    e.domEvent.stopPropagation();
    setArrange(Number(e.key));
  }

  function menu() {
    const { t } = useTranslation();
    let listArr: ReactElement[] = [];

    for (let i = 1; i <= defColItem; i++) {
      let item = (
        <Menu.Item key={i}>
          {i}
          {t('列')}
        </Menu.Item>
      );
      listArr.push(item);
    }

    return <Menu onClick={handleMenuClick}>{listArr}</Menu>;
  }

  const generateRightButton = () => {
    const { t } = useTranslation();
    return (
      <>
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            onAddChart(groupInfo.id);
          }}
        >
          {t('新增图表')}
        </Button>
        <Divider type='vertical' />
        <Dropdown overlay={menu()}>
          <Button
            type='link'
            size='small'
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {t('一键规整')}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            onUpdateChartGroup(groupInfo);
          }}
        >
          {t('修改')}
        </Button>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            onMoveUpChartGroup(groupInfo);
          }}
        >
          {t('上移')}
        </Button>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            onMoveDownChartGroup(groupInfo);
          }}
        >
          {t('下移')}
        </Button>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            confirm({
              title: `${t('是否删除分类')}：${groupInfo.name}`,
              onOk: async () => {
                onDelChartGroup(groupInfo.id);
              },

              onCancel() {},
            });
          }}
        >
          {t('删除')}
        </Button>
      </>
    );
  };

  const generateDOM = () => {
    return (
      chartConfigs &&
      chartConfigs.length > 0 &&
      chartConfigs.map((item, i) => {
        const { metric, tags = {} } = item.configs;
        let { prome_ql } = item.configs;
        let tagsArr: Tag[] = Object.keys(tags)
          .filter((key) => tags[key])
          .reduce((result, key) => {
            result = result.concat(
              tags[key].map((v: any) => ({
                key,
                value: v,
              })),
            );
            return result;
          }, []);
        let classpath_id, classpath_prefix;

        if (variableConfig) {
          variableConfig.tags.forEach((item) => {
            if (prome_ql) {
              if (Array.isArray(prome_ql)) {
                prome_ql = prome_ql.map((i) => {
                  if (item.value === '*') {
                    return i.replaceAll('$' + item.key, '.+');
                  }

                  return i.replaceAll('$' + item.key, item.value);
                });
              } // prome_ql = prome_ql.replaceAll('$' + item.key, item.value);
            } else if (
              !tagsArr.find((tag: Tag) => tag.key === item.key) &&
              item.value !== '*'
            ) {
              const { key, value } = item;
              tagsArr.push({
                key,
                value,
              });
            }
          });
          classpath_id =
            variableConfig.classpath_id === '*'
              ? undefined
              : variableConfig.classpath_id;
          classpath_prefix =
            variableConfig.classpath_id === '*'
              ? undefined
              : variableConfig.classpath_prefix;
        }

        return (
          <div
            style={{
              border: '1px solid #e0dee2',
            }}
            key={String(i)}
          >
            <D3Chart
              barControl='multiOrSort'
              title={chartConfigs[i].configs.name}
              rightBar={
                <>
                  <Button
                    type='link'
                    size='small'
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(item.configs.link);
                    }}
                    disabled={!item.configs.link}
                  >
                    <LinkOutlined />
                  </Button>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() => onUpdateChart(groupInfo, item)}
                        >
                          {t('编辑图表')}
                        </Menu.Item>

                        <Menu.Item
                          danger
                          onClick={() => {
                            confirm({
                              title: `${t('是否删除图表')}：${
                                item.configs.name
                              }`,
                              onOk: async () => {
                                onDelChart(groupInfo, item);
                              },

                              onCancel() {},
                            });
                          }}
                        >
                          {t('删除图表')}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button
                      type='link'
                      size='small'
                      onClick={(e) => e.preventDefault()}
                    >
                      <SettingOutlined />
                    </Button>
                  </Dropdown>
                </>
              }
              options={{
                classpath_id,
                classpath_prefix:
                  classpath_prefix === undefined
                    ? undefined
                    : !!classpath_prefix,
                ...item.configs,
                prome_ql,
                range,
                step,
                tags: tagsArr,
                metric: metric,
                limit: 50,
              }}
            />
          </div>
        );
      })
    );
  };

  const renderCharts = useCallback(() => {
    const { t } = useTranslation();
    return (
      <div
        style={{
          width: '100%',
        }}
      >
        {chartConfigs && chartConfigs.length > 0 ? (
          <ResponsiveReactGridLayout
            cols={{
              lg: cols,
              sm: cols,
              md: cols,
              xs: cols,
              xxs: cols,
            }}
            layouts={layout}
            onLayoutChange={onLayoutChange}
            measureBeforeMount={false}
            useCSSTransforms={false}
            preventCollision={false}
            isBounded={true}
            draggableHandle='.chart-title'
          >
            {generateDOM()}
          </ResponsiveReactGridLayout>
        ) : (
          <p className='empty-group-holder'>Now it is empty</p>
        )}
      </div>
    );
  }, [mounted, groupInfo.updateTime, range, variableConfig, step]);
  return (
    <Collapse defaultActiveKey={['0']}>
      <Panel
        header={<span className='panel-title'>{groupInfo.name}</span>}
        key='0'
        extra={generateRightButton()}
      >
        {renderCharts()}
      </Panel>
    </Collapse>
  );
}
