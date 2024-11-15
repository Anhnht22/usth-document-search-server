class baseCollection {
  constructor(table) {
    this.table = table;

    this.arraySort = [];
    this.stringSelect = "SELECT t.* ";
    this.arrayTable = [];
    this.stringJoin = "";
    this.arrayCondition = [];
    this.arrayConditionRaw = [];
    this.stringCondition = " ";
    this.stringFilter = " ";
    this.stringGroupBy = " ";
    this.limit = 20;
    this.offset = 0;
  }

  addSelect(arrayField = []) {
    if (arrayField.length != 0) {
      for (let i = 0; i < arrayField.length; i++) {
        if (i == 0) {
          this.stringSelect = `SELECT ${arrayField[i]}`;
        } else {
          this.stringSelect += `, ${arrayField[i]}`;
        }
      }
    }

    return this.stringSelect;
  }

  addGroupBy(arrayField = [], havingCondition = []) {
    if (arrayField.length != 0) {
      for (let i = 0; i < arrayField.length; i++) {
        if (i == 0) {
          this.stringGroupBy = `GROUP BY ${arrayField[i]}`;
        } else {
          this.stringGroupBy += `, ${arrayField[i]}`;
        }
      }
    }

    if (havingCondition.length != 0) {
      for (let i = 0; i < havingCondition.length; i++) {
        if (i == 0) {
          this.stringGroupBy += ` HAVING ${havingCondition[i]}`;
        } else {
          this.stringGroupBy += `, ${havingCondition[i]}`;
        }
      }
    }

    return this.stringGroupBy;
  }

  reset() {
    this.arraySort = [];
    this.stringSelect = "SELECT t.* ";
    this.arrayTable = [];
    this.stringJoin = "";
    this.arrayCondition = [];
    this.stringCondition = " ";
    this.stringFilter = " ";
    this.stringGroupBy = " ";
    this.limit = 20;
    this.offset = 0;
  }

  setLimit(limit) {
    let _limit = Math.min(limit, 2000);
    _limit = Math.max(_limit, 1);
    this.limit = _limit;
  }

  setOffset(pageNumber) {
    this.offset = (this.limit) * (pageNumber - 1);
  }

  addJoin(table, fieldJoin, rootJoin, typeJoin = "") {
    this.stringJoin += ` ${typeJoin} ${table} ON ${fieldJoin} = ${rootJoin} `;
    return this.stringJoin;
  }

  join(table, fieldJoin, rootJoin, typeJoin = '') {
    this.stringJoin += ` ${typeJoin} JOIN ${table} ON ${fieldJoin} = ${rootJoin} `;
    return this.stringJoin;
  }

  joinCaseWhen(table, caseWhen, typeJoin = '') {
    this.stringJoin += ` ${typeJoin} JOIN ${table} ON ${caseWhen} `;
    return this.stringJoin;
  }

  andWhereIn(field, operation, value) {
    if (field != "") {
      let condition = {
        connect: "AND",
        field: field,
        operation: operation,
        value: "(" + value + ")",
      };

      this.arrayCondition.push(condition);
    }
  }

  andWhere(field, operation, value) {
    if (field != "") {
      if (operation == "LIKE") {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition = {
        connect: "AND",
        field: field,
        operation: operation != "" ? operation : "=",
        value: value,
      };

      this.arrayCondition.push(condition);
    }
  }

  andWhereRaw(value) {
    if (value != "") {
      let condition = {
        connect: "AND",
        field: "",
        operation: "",
        value: value,
      };

      this.arrayCondition.push(condition);
    }
  }

  andOrWhere(field, operation, value, pos_cond) {
    if (field != "") {
      if (operation == "LIKE") {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition = {
        operation: operation != "" ? operation : "=",
      }
      switch (pos_cond) {
        case 'first':
          condition.connect = "AND"
          condition.field = "(" + field;
          condition.value = value;
          break;
        case 'middle':
          condition.connect = "OR"
          condition.field = field;
          condition.value = value;
          break;
        case 'last':
          condition.connect = "OR"
          condition.field = field;
          condition.value = value + ")";
          break;
        default:
      }

      this.arrayCondition.push(condition);
    }
  }

  orWhere(field, operation, value) {
    if (field != "") {
      if (operation == "LIKE") {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition = {
        connect: "OR",
        field: field,
        operation: operation != "" ? operation : "=",
        value: value,
      };

      this.arrayCondition.push(condition);
    }
  }

  orderBy() {
    let string_filter = "";
    for (let i = 0; i < this.arraySort.length; i++) {
      if (i == 0) {
        string_filter +=
          " ORDER BY " +
          `${this.arraySort[i].field}` +
          ` ${this.arraySort[i].sort_by}`;
      } else {
        string_filter += `, ${this.arraySort[i].field} ${this.arraySort[i].sort_by}`;
      }
    }
    this.stringFilter = string_filter;
    return this.stringFilter;
  }

  addSort(field = "", value = "") {
    if (field != "" && value != "") {
      let record = {
        field: field,
        sort_by: value,
      };

      this.arraySort.push(record);
    }
  }

  setOnlyActiveRecords(isActive) {
    this.andWhere("t.IsActive", "=", isActive ? "Y" : "N");
  }

  where() {
    let stringCondition = "";
    if (this.arrayCondition.length > 0) {
      let arrayCheckExist = [];
      for (let i = 0; i < this.arrayCondition.length; i++) {
        arrayCheckExist[
          this.arrayCondition[i].field + "_" + this.arrayCondition[i].value
        ] = this.arrayCondition[i];
      }

      let i = 0;
      for (var data in arrayCheckExist) {
        if (i == 0) {
          stringCondition += `WHERE ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
        } else {
          stringCondition += ` ${arrayCheckExist[data].connect} ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
        }
        i++;
      }
    }
    return stringCondition;
  }

  whereRaw() {

  }

  sqlCount() {
    const condition = this.where();
    const sql =
      this.arrayCondition.length === 0
        ? `SELECT count(1) AS total FROM ${this.table} t ${this.stringJoin}`
        : `SELECT count(1) AS total FROM ${this.table} t ${this.stringJoin} ${condition}`;
    return sql;
  }

  sqlById(id) {
    let sql_string = "";
    sql_string =
      this.stringSelect +
      ` FROM ${this.table} t ` + this.stringJoin +
      ` WHERE t.id= ${id} LIMIT 1 `;
    this.reset();
    return sql_string;
  }

  sql(is_limit = true) {
    let sql_string = "";
    this.stringCondition = this.where();

    sql_string =
      this.stringSelect +
      ` FROM ${this.table} t ` +
      this.stringJoin +
      this.stringCondition +
      this.stringGroupBy +
      this.orderBy();
    if (is_limit == true) {
      sql_string += ` LIMIT ${this.limit} OFFSET ${this.offset}`;
    }

    this.reset();
    return sql_string;
  }

  finallizeTotalCount() {
    const condition = this.genCondition();
    // const sql = (this.arrayCondition.length === 0)
    //   ? `SELECT count(*) AS total FROM ${this.table} t ${this.stringJoin} ${this.stringGroupBy}`
    //   : `SELECT count(*) AS total FROM ${this.table} t ${this.stringJoin} ${condition} ${this.stringGroupBy}`
    //   ;
    let sql = (this.arrayCondition.length === 0)
      ? `FROM ${this.table} t ${this.stringJoin} ${this.stringGroupBy}`
      : `FROM ${this.table} t ${this.stringJoin} ${condition} ${this.stringGroupBy}`
      ;
    sql = this.stringGroupBy.trim().length > 0
      ? `WITH data AS (SELECT 1 ${sql}) SELECT COUNT(*) AS total FROM data`
      : `SELECT count(*) AS total ${sql}`
      ;

    return sql;
  }

  finallize(is_limit = true) {
    //this.reset();
    //console.log("Array Condition");
    //console.log(this.arrayCondition);

    let sql_string = '';
    this.stringCondition = this.genCondition();

    sql_string = this.stringSelect +
      ` FROM ${this.table} t ` +
      this.stringJoin +
      this.stringCondition +
      this.stringGroupBy +
      this.orderBy();

    if (is_limit == true) {
      sql_string += ` LIMIT ${this.limit} OFFSET ${this.offset}`;
      console.log(sql_string);
    }

    // console.log('SQL String', sql_string);
    this.reset();
    return sql_string;
  }

  genCondition() {
    let stringCondition = '';
    if (this.arrayCondition.length > 0) {
      let arrayCheckExist = [];
      for (let i = 0; i < this.arrayCondition.length; i++) {
        arrayCheckExist[this.arrayCondition[i].field + "_" + this.arrayCondition[i].value] = this.arrayCondition[i];
      }

      let i = 0;
      for (var data in arrayCheckExist) {
        if (i == 0) {
          stringCondition += `WHERE ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
        } else {
          stringCondition += ` ${arrayCheckExist[data].connect} ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
        }
        i++;
      }
    }
    return stringCondition;
  }
}

module.exports = baseCollection;
