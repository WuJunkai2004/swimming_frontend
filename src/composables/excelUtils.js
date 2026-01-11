import { read, utils } from 'xlsx';

/**
 * 一个用于解析 Excel 文件的工具类。
 */
export class Excetract {
  // 私有属性，用于存储解析后的内部数据
  #workbook;
  #fileName;
  #worksheet;
  #data; // 存储所有工作表数据的二维数组
  #title; // 存储解析出的标题
  #headers; // 存储解析出的表头数组
  #headerRowIndex; // 存储表头所在的行索引

  /**
   * 构造函数是私有的，请使用 Excetract.create(file) 静态方法来创建实例。
   * @param {Object} workbook - 由 SheetJS 解析出的工作簿对象
   * @param {string} fileName - 原始文件名
   */
  constructor(workbook, fileName) {
    this.#workbook = workbook;
    this.#fileName = fileName;
    this.#worksheet = null;
    this.#data = [];
    this.#title = '';
    this.#headers = [];
    this.#headerRowIndex = -1;

    // 在构造时立即执行解析
    this._initialize();
  }

  /**
   * 静态工厂方法，用于异步创建和初始化 Excetract 实例。
   * @param {File} file - 用户通过 <input type="file"> 选择的文件对象
   * @returns {Promise<Excetract>} 一个 Excetract 实例的 Promise
   */
  static create(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('未提供文件'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: 'array' });
          // 解析成功后，创建实例并 resolve
          resolve(new Excetract(workbook, file.name));
        } catch (error) {
          reject(new Error(`文件解析失败: ${error.message}`));
        }
      };
      reader.onerror = (error) => {
        reject(new Error(`文件读取失败: ${error.message}`));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 内部初始化方法，用于解析工作簿
   * @private
   */
  _initialize() {
    if (!this.#workbook || !this.#workbook.SheetNames.length) {
      throw new Error('无效的 Excel 工作簿');
    }
    // 1. 获取第一个工作表
    const firstSheetName = this.#workbook.SheetNames[0];
    this.#worksheet = this.#workbook.Sheets[firstSheetName];
    // 2. 将工作表转换为二维数组，方便处理
    //  { header: 1 } 会将所有内容转换为数组的数组
    this.#data = utils.sheet_to_json(this.#worksheet, { header: 1 });
    // 3. 在初始化时就解析出标题和表头
    this._findTitle();
    this._findHeaders();
  }

  /**
   * 内部方法，用于实现 getTitle 的逻辑
   * @private
   */
  _findTitle() {
    const firstRow = this.#data[0] || [];
    // 过滤掉空单元格后，如果第一行只有一个格子
    if (firstRow.filter(cell => cell != null && cell !== '').length === 1) {
      this.#title = firstRow[0];
    } else {
      this.#title = this.#fileName;
    }
  }

  /**
   * 内部方法，用于实现 getHead 的逻辑
   * @private
   */
  _findHeaders() {
    for (let i = 0; i < this.#data.length; i++) {
      const row = this.#data[i] || [];
      // 过滤掉 null, undefined, 空字符串等无效单元格
      const validCells = row.filter(cell => cell != null && String(cell).trim() !== '');
      // 条件1: 有超过3个有效格子
      const hasEnoughCells = validCells.length > 3;
      // 条件2: 某个格子里包含“姓名”二字
      const hasNameCell = row.some(cell => typeof cell === 'string' && cell.includes('姓名'));
      if (hasEnoughCells && hasNameCell) {
        this.#headers = row;
        this.#headerRowIndex = i;
        return; // 找到后立即退出
      }
    }
  }

  /**
   * 获取表头（列名数组）
   * @returns {string[]} 表头数组
   */
  getHead() {
    return this.#headers;
  }

  /**
   * 获取标题
   * @returns {string} 比赛标题或文件名
   */
  getTitle() {
    return this.#title;
  }

  /**
   * 根据列索引获取该列的数据
   * @param {number} colIndex - 列的索引（从0开始）
   * @returns {Array} 该列从表头行之后开始的所有数据
   */
  getCol(colIndex) {
    if (this.#headerRowIndex === -1 || colIndex < 0 || colIndex >= (this.#headers.length || 0)) {
      return []; // 如果没找到表头或索引无效，返回空数组
    }
    // 从表头行的下一行开始截取数据
    const dataRows = this.#data.slice(this.#headerRowIndex + 1);
    // 提取每一行中指定索引的单元格数据
    return dataRows.map(row => row[colIndex] || null); // 如果单元格不存在则返回 null
  }

  /**
   * 根据列名模糊匹配来获取该列的数据
   * @param {string} colName - 要搜索的列名（模糊匹配）
   * @returns {Array} 找到的第一列从表头行之后开始的所有数据
   */
  getColByStr(colName) {
    if (this.#headerRowIndex === -1) {
      return [];
    }
    // 找到第一个包含 colName 的表头的索引
    const colIndex = this.#headers.findIndex(header => 
      typeof header === 'string' && header.includes(colName)
    );
    if (colIndex !== -1) {
      // 复用 getCol 方法
      return this.getCol(colIndex);
    }
    return []; // 如果没找到匹配的列名，返回空数组
  }
    
  /**
   * 根据列名完全匹配来获取该列的数据
   * @param {string} colName - 要搜索的列名（完全匹配）
   * @returns {Array} 找到的第一列从表头行之后开始的所有数据
   */
  getColOf(colName) {
    if (this.#headerRowIndex === -1) {
      return [];
    }
    // 找到第一个完全等于 colName 的表头的索引
    const colIndex = this.#headers.findIndex(header => header === colName);
    if (colIndex !== -1) {
      // 复用 getCol 方法
      return this.getCol(colIndex);
    }
    return []; // 如果没找到匹配的列名，返回空数组
  }
}


/**
 * @brief 获取游泳项目
 */
export function getSwimEvent(head) {
  return head.filter(item => {
    // 首个字符是数字
    return typeof item === 'string' && /^\d/.test(item.trim());
  });
}


// 缓存对象，用于存储计算结果
const containScoreCache = new Map();
const editScoreCache = new Map();

/**
 * @brief 获取最接近的名称
 * @param {string} name
 * @param {Array} nameList
 */
export function getNearestStr(name, nameList) {
  if (!name || nameList.length === 0) {
    return null;
  }

  // 计算包含匹配得分（优先级最高）
  const calculateContainScore = (search, target) => {
    const cacheKey = `${search}--${target}`;

    // 检查缓存
    if (containScoreCache.has(cacheKey)) {
      return containScoreCache.get(cacheKey);
    }

    if (target.includes(search)) {
      containScoreCache.set(cacheKey, 1.0);
      return 1.0; // 完全包含得分最高
    }
    // 计算字符级别的包含度
    const searchChars = [...search];
    let matchCount = 0;
    let lastMatchIndex = -1;

    for (const char of searchChars) {
      const foundIndex = target.indexOf(char, lastMatchIndex + 1);
      if (foundIndex !== -1) {
        matchCount++;
        lastMatchIndex = foundIndex;
      }
    }

    let score = matchCount / searchChars.length;

    // 缓存结果
    containScoreCache.set(cacheKey, score);
    return score;
  };

  // 计算编辑距离相似度（作为备选）
  const calculateEditScore = (s1, s2) => {
    const cacheKey = `${s1}--${s2}`;

    // 检查缓存
    if (editScoreCache.has(cacheKey)) {
      return editScoreCache.get(cacheKey);
    }

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);
    const score = 1 - distance / maxLen;

    // 缓存结果
    editScoreCache.set(cacheKey, score);
    return score;
  };

  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of nameList) {
    // 优先使用包含匹配
    const containScore = calculateContainScore(name, candidate);
    const editScore = calculateEditScore(name, candidate);
    const finalScore = containScore * 0.8 + editScore * 0.2;

    // console.log(`Comparing "${name}" with "${candidate}": contain=${containScore.toFixed(3)}, edit=${editScore.toFixed(3)}, final=${finalScore.toFixed(3)}`);

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}