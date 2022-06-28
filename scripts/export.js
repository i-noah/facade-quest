const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios").default;

(async () => {
  if (!argv.i) {
    console.error("未指定输入数据集");
    return;
  }

  if (!argv.o) {
    console.error("未指定输出位置");
    return;
  }

  const { data } = await axios.get("http://localhost:3012/api/quest/all");

  const res = {};

  const facades = fs.readdirSync(argv.i).reduce(
    (res, file) => ({
      ...res,
      [file.replace(path.extname(file), "")]: {
        name: file,
        fullname: path.resolve(argv.i, file),
      },
    }),
    {}
  );

  for (let row of data) {
    const quest = require("../config/quest.json").find(
      (item) => item.id.toString() === row.qid
    );
    if (!quest) continue;
    const id = quest.title;
    if (!res[id]) res[id] = {};
    if (!res[id][row.uuid]) res[id][row.uuid] = [];
    res[id][row.uuid].push(row.answer);
  }

  /**
   * @type {Record<string, Record<'0' | '1' | '-1', string[]>>}
   */
  const output = {};

  Object.keys(res).forEach((key) => {
    const labels = res[key];

    if (Object.keys(labels).length !== 2200) return;

    if (!output[key]) output[key] = { 0: [], 1: [], "-1": [] };

    for (let id in labels) {
      const label = labels[id];
      if (label.length === 2 && new Set(label).size !== 1) {
        output[key]["-1"].push(id);
      } else {
        const target = findMost(label);
        output[key][target].push(id);
      }
    }
  });

  if (argv.e) {
    const outputDir = argv.o;
    Object.keys(output).forEach((label) => {
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
      const dir = path.join(outputDir, label);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      Object.keys(output[label]).forEach((tof) => {
        output[label][tof].forEach((id, i) => {
          if (tof === "-1") {
            fs.copySync(facades[id].fullname, path.join(dir, facades[id].name));
          } else {
            const loc = path.join(dir, tof);
            if (!fs.existsSync(loc)) fs.mkdirpSync(loc);
            fs.copySync(facades[id].fullname, path.join(loc, facades[id].name));
          }
          console.log(
            `Extract: [${label}-${tof}]  ${i} / ${output[label][tof].length}`
          );
        });
      });
    });
    console.log("成功导出已分类图片");
  } else {
    if (!fs.existsSync(argv.o)) fs.mkdirpSync(argv.o);
    const of = path.join(argv.o, "dataset.json");
    fs.writeFile(of, JSON.stringify(output, null, "\t"));

    console.log(`成功导出至${of}`);
  }
})();

// const data = papaparse.parse(
//   fs.readFileSync("./quests.csv", {
//     encoding: "utf-8",
//   })
// );

// const table = [];
// const header = data.data[0];

// for (let i = 1; i < data.data.length; i++) {
//   const tmp = {};
//   for (let j = 0; j < data.data[i].length; j++) {
//     const h = header[j];
//     let d = data.data[i][j];
//     tmp[h] = d;
//   }

//   table.push(tmp);
// }

function findMost(arr) {
  if (arr.length === 1) return arr[0];
  let mf = 1;
  let m = 0;
  let item;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      if (arr[i] == arr[j]) m++;
      if (mf < m) {
        mf = m;
        item = arr[i];
      }
    }
    m = 0;
  }

  return item;
}
