import { MockRequest } from '@delon/mock';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const list: any[] = [];

for (let i = 0; i < 46; i += 1) {
  list.push({
    key: i,
    disabled: i % 6 === 0,
    href: 'https://ant.design',
    avatar: [
      'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
      'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png'
    ][i % 2],
    no: `TradeCode ${i}`,
    title: `一个任务名称 ${i}`,
    owner: '曲丽丽',
    description: '这是一段描述',
    callNo: Math.floor(Math.random() * 1000),
    status: Math.floor(Math.random() * 10) % 4,
    updatedAt: new Date(`2017-07-${i < 18 ? `0${Math.floor(i / 2) + 1}` : Math.floor(i / 2) + 1}`),
    createdAt: new Date(`2017-07-${i < 18 ? `0${Math.floor(i / 2) + 1}` : Math.floor(i / 2) + 1}`),
    progress: Math.ceil(Math.random() * 100)
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRule(params: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let ret: any[] = [...list];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const sorter = params.sorter;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const s = (sorter || '').split('_');
  if (s.length !== 2) return ret;

  const [sortField, sortDir] = s;
  ret = ret.sort((prev: any, next: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    return sortDir === 'desc' ? next[sortField] - prev[sortField] : prev[sortField] - next[sortField];
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (params.statusList && params.statusList.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    ret = ret.filter(data => params.statusList.indexOf(data.status) > -1);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (params.no) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    ret = ret.filter(data => data.no.indexOf(params.no) > -1);
  }
  return ret;
}

function removeRule(nos: string): boolean {
  nos.split(',').forEach(no => {
    const idx = list.findIndex(w => w.no === no);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  });
  return true;
}

function saveRule(description: string): void {
  const i = Math.ceil(Math.random() * 10000);
  list.unshift({
    key: i,
    href: 'https://ant.design',
    avatar: [
      'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
      'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png'
    ][i % 2],
    no: `TradeCode ${i}`,
    title: `一个任务名称 ${i}`,
    owner: '曲丽丽',
    description,
    callNo: Math.floor(Math.random() * 1000),
    status: Math.floor(Math.random() * 10) % 2,
    updatedAt: new Date(),
    createdAt: new Date(),
    progress: Math.ceil(Math.random() * 100)
  });
}

export const RULES = {
  '/rule': (req: MockRequest) => getRule(req.queryString),
  'DELETE /rule': (req: MockRequest) => removeRule(req.queryString.nos),
  'POST /rule': (req: MockRequest) => saveRule(req.body.description)
};
