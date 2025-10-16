import { DBF, Field } from "@liuxspro/libs/dbf";

export const FIELD_LENGTH = {
  DKMC: 254,
  DKDM: 100,
  XZQDM: 12,
  XZQMC: 100,
  YDMJ: 17,
  DH: 16,
  SCRQ: 8,
  SCDW: 254,
  BZ: 254,
};

const DKMC = new Field("DKMC", "C", 254);
const DKDM = new Field("DKDM", "C", 100);
const XZQDM = new Field("XZQDM", "C", 12);
const XZQMC = new Field("XZQMC", "C", 100);
const YDMJ = new Field("YDMJ", "N", 16, 2);
const DH = new Field("DH", "N", 16);
const SCRQ = new Field("SCRQ", "D");
const SCDW = new Field("SCDW", "C", 254);
const BZ = new Field("BZ", "C", 254);

const BJ_FIELDS = [DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH, SCRQ, SCDW, BZ];

export function create_dbf(fields) {
  let { DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH, SCRQ, SCDW, BZ } = fields;
  if (SCRQ !== null) {
    SCRQ = new Date(SCRQ);
  }
  const record = [DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH, SCRQ, SCDW, BZ];
  const dbf = new DBF(BJ_FIELDS, [record]);
  return dbf.data;
}
