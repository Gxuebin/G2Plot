import { Waterfall } from '../../src';
import { Shape } from '@antv/g';
import * as _ from '@antv/util';

describe('waterfall plot', () => {
  const data = [
    { type: '日用品', money: 300 },
    { type: '伙食费', money: 900 },
    { type: '交通费', money: 200 },
    { type: '水电费', money: 300 },
    { type: '房租', money: 1200 },
    { type: '商场消费', money: 1000 },
    { type: '应酬交际', money: -2000 },
  ];

  const plotOptions = {
    title: {
      visible: true,
      text: '每月收支情况（瀑布图）',
    },
    forceFit: true,
    data,
    padding: 'auto',
    data,
    xField: 'type',
    yField: 'money',
    meta: {
      type: {
        alias: '类别',
      },
      money: {
        alias: '金额',
      },
    },
  };

  const canvasDiv = document.createElement('div');
  canvasDiv.style.width = '600px';
  canvasDiv.style.height = '600px';
  canvasDiv.style.left = '30px';
  canvasDiv.style.top = '30px';
  canvasDiv.id = 'canvas1';
  document.body.appendChild(canvasDiv);

  const waterfallPlot = new Waterfall(canvasDiv, plotOptions);
  const waterfallLayer = waterfallPlot.getLayer();

  it('normal', () => {
    waterfallPlot.render();
    const shapes = waterfallLayer.view.get('elements')[0].getShapes();
    expect(shapes.length).toBe(data.length * 2 + 1);
    const lines = shapes.filter((s) => s.name === 'leader-line');
    expect(lines.length).toBe(data.length);
  });

  it('not show total', () => {
    waterfallPlot.updateConfig({
      showTotal: {
        visible: false,
      },
    });
    waterfallPlot.render();
    const shapes = waterfallLayer.view.get('elements')[0].getShapes();
    expect(shapes.length).toBe(data.length * 2 - 1);
    const lines = shapes.filter((s) => s.name === 'leader-line');
    expect(lines.length).toBe(data.length - 1);
  });

  it('diff-label', () => {
    waterfallPlot.updateConfig({
      diffLabel: {
        visible: true,
        style: {
          fill: 'red',
        },
        formatter: (text, item, index) => {
          if (text.startsWith('+')) {
            return `涨 ${text.substr(1)}`;
          } else if (text.startsWith('-')) {
            return `跌 ${text.substr(1)}`;
          }
          return text;
        },
      },
    });
    waterfallPlot.render();
    const shapes = waterfallLayer.view.get('elements')[0].getShapes();
    // @ts-ignore
    const diffLabel = waterfallLayer.diffLabel;
    const labelShapes = diffLabel.container.get('children')[0].get('children');
    const intervals = shapes.filter((s) => s.name === 'interval');
    /** auto hide label that is overflowed */
    expect(labelShapes.length).toBe(intervals.length);
    expect(
      _.every(
        intervals,
        (shape: Shape, idx) => labelShapes[idx].attr('y') === (shape.getBBox().minY + shape.getBBox().maxY) / 2
      )
    ).toBe(true);
    expect(labelShapes[0].attr('text')).toBe('涨 300');
    expect(labelShapes[0].attr('fill')).toBe('red');
  });

  it('hidden diff-label', () => {
    waterfallPlot.updateConfig({
      diffLabel: {
        visible: false,
      },
    });
    waterfallPlot.render();
    // @ts-ignore
    const diffLabel = waterfallLayer.diffLabel;
    expect(diffLabel).toBe(null);
  });

  afterAll(() => {
    waterfallPlot.destroy();
  });
});
