export default class SortableTable {
  sortField = null;
  sortOrder = null;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.element = this.createTemplate();
  }

  createHeaderCellHtml(item) {
    const isSortedBy = item.id === this.sortField;
    const order = isSortedBy ? this.sortOrder : "";

    let arrowHtml = "";
    if (isSortedBy) {
      arrowHtml = `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `;
    }

    return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${order}">
        <span>${item.title}</span>
        ${arrowHtml}
      </div>
    `;
  }

  createHeaderHtml() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig
          .map((item) => this.createHeaderCellHtml(item))
          .join("")}
      </div>
    `;
  }

  createTableRowHtml(item) {
    return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.headerConfig
          .map((field) => {
            return this.createTableCellHtml(item, field);
          })
          .join("")}
      </a>
    `;
  }

  createTableCellHtml(item, field) {
    const fieldId = field.id;

    if (field.template) {
      return field.template(item[fieldId]);
    }
    return `
      <div class="sortable-table__cell">${item[fieldId]}</div>
    `;
  }

  createTableHtml() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.data.map((item) => this.createTableRowHtml(item)).join("")}
      </div>
    `;
  }

  createTemplateHtml() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.createHeaderHtml()}
          ${this.createTableHtml()}
        </div>
      </div>
    `;
  }

  createTemplate() {
    const templateHtml = this.createTemplateHtml();

    const wrap = document.createElement("div");
    wrap.innerHTML = templateHtml.trim();

    const element = wrap.firstChild;

    this.subElements = {
      header: element.querySelector('[data-element="header"]'),
      body: element.querySelector('[data-element="body"]'),
    };

    return element;
  }

  reRender() {
    const newElement = this.createTemplate();
    this.element.replaceWith(newElement);
    this.element = newElement;
  }

  sortData() {
    const sortType = this.headerConfig.find(
      (item) => item.id === this.sortField
    ).sortType;

    let sortFunc = () => {};

    switch (sortType) {
      case "number":
        sortFunc = this.sortDataByNumericTypeField.bind(this);
        break;
      case "string":
        sortFunc = this.sortDataByStringTypeField.bind(this);
        break;
      default:
        break;
    }

    sortFunc();
  }

  sortDataByNumericTypeField() {
    this.data.sort((a, b) => {
      const modifier = this.sortOrder === "asc" ? 1 : -1;
      return modifier * (a[this.sortField] - b[this.sortField]);
    });
  }

  sortDataByStringTypeField() {
    this.data.sort((a, b) => {
      const modifier = this.sortOrder === "asc" ? 1 : -1;
      return (
        modifier * this.compareStrings(a[this.sortField], b[this.sortField])
      );
    });
  }

  sort(fieldId, order) {
    if (!fieldId || !order) return;

    this.sortField = fieldId;
    this.sortOrder = order;

    this.sortData();
    this.reRender();
  }

  compareStrings = (string1, string2) => {
    return string1.localeCompare(string2, ["ru", "en"], {
      sensitivity: "variant",
      caseFirst: "upper",
    });
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
