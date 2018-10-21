import { extend, first } from 'lodash';

/**
 * @name 彩种玩法
 *
 * @param {Array} cids 彩种id
 * @param {Object} kinds 玩法编号:玩法名称
 */
export const playTree = [
  // ssc
  {
    layout: 'ssc',
    cids: [2, 12, 14, 26, 28, 32, 102, 112, 114, 116, 120, 48, 50, 52],
    kinds: [
      { cid: 21000, name: '两面' },
      { cid: 22000, name: '1-5球' },
      { cid: 23000, name: '前中后' },
    ],
  },
  // 11x5
  {
    layout: '11x5',
    cids: [4, 16, 18, 104],
    kinds: [
      { cid: 41000, name: '两面' },
      { cid: 42000, name: '1-5球' },
      { cid: 43000, name: '连码' },
    ],
  },
  // k3
  {
    layout: 'k3',
    cids: [6, 20, 22, 106],
    kinds: [
      { cid: 61000, name: '单骰' },
      { cid: 62000, name: '不同号' },
      { cid: 63000, name: '同号' },
      { cid: 64000, name: '总和' },
    ],
  },
  // pk10
  {
    layout: 'pk10',
    cids: [8, 24, 108, 118],
    kinds: [
      { cid: 81000, name: '两面' },
      { cid: 82000, name: '冠亚和值' },
      { cid: 83000, name: '1-5名' },
      { cid: 84000, name: '6-10名' },
    ],
  },
  // lhc
  {
    layout: 'lhc',
    cids: [10, 110],
    kinds: [
      { cid: 1010000, name: '特码' },
      { cid: 1100000, name: '平特肖尾' },
      { cid: 1020000, name: '两面' },
      { cid: 1070000, name: '色波' },
      { cid: 1030000, name: '正码' },
      { cid: 1040000, name: '正码1-6' },
      { cid: 1050000, name: '正特' },
      { cid: 1060000, name: '连码' },
      { cid: 1170000, name: '自选不中' },
      { cid: 1110000, name: '连肖' },
      { cid: 1140000, name: '连尾' },
      { cid: 1080000, name: '特码头尾' },
      { cid: 1090000, name: '总肖' },
      { cid: 1120000, name: '特肖' },
      { cid: 1130000, name: '合肖' },
      { cid: 1150000, name: '正肖' },
      { cid: 1160000, name: '特码五行' },
    ],
  },
  // xy28
  {
    layout: 'xy28',
    cids: [30],
    kinds: [
      { cid: 121000, name: '混合' }, { cid: 122000, name: '特码和值' },
    ],
  },
  // kl8
  {
    layout: 'kl8',
    cids: [34, 42, 44],
    kinds: [
      { cid: 181000, name: '趣味' }, { cid: 182000, name: '任选' },
    ],
  },
  // 广东k10
  {
    layout: 'k10a',
    cids: [40, 46],
    kinds: [
      { cid: 401000, name: '趣味' },
      { cid: 402000, name: '任选' },
      { cid: 403000, name: '连码' },
      { cid: 404000, name: '1-4球' },
      { cid: 405000, name: '5-8球' },
    ],
  },
  // 广西k10
  {
    layout: 'k10b',
    cids: [38],
    kinds: [
      { cid: 381000, name: '趣味' },
      { cid: 382000, name: '任选' },
      { cid: 383000, name: '1-5球' }],
  },
];
