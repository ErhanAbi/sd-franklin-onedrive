import {
  LitElement,
  html,
  unsafeHTML,
} from "../../scripts/vendor/lit-all_v2.6.1.min.js";

class Dialog extends LitElement {
  static properties = {
    packageDetails: {},
    eula: { state: true },
  };

  _loadEula() {
    this.eula = "";
    const eulaLink = this.packageDetails.eula;
    if (!eulaLink) {
      return;
    }
    const eulaURL = new URL(eulaLink);
    const localURL = new URL(location.href);
    localURL.pathname = eulaURL.pathname;

    fetch(`${localURL.href}.plain.html`)
      .then((response) => response.text())
      .then((text) => {
        this.eula = text;
      });
  }

  setPackageDetails(packageDetails) {
    this.packageDetails = packageDetails;
    this._loadEula();
  }

  open() {
    this.querySelector(".spectrum-Underlay").classList.add("is-open");
    this.querySelector(".spectrum-Modal-wrapper").classList.add("is-open");
    this.querySelector(".spectrum-Modal").classList.add("is-open");
    document.body.style.overflow = "hidden";
    this._showTab("details");
  }

  close() {
    this.querySelector(".spectrum-Underlay").classList.remove("is-open");
    this.querySelector(".spectrum-Modal-wrapper").classList.remove("is-open");
    this.querySelector(".spectrum-Modal").classList.remove("is-open");
    document.body.style.overflow = "auto";
  }

  _handleEscKey = (ev) => {
    if (ev.key === "Escape") {
      this.close();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keyup", this._handleEscKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keyup", this._handleEscKey);
  }

  _formatPackageSize(size = 0) {
    if (size === 0) {
      return "0 MB";
    }
    const k = 1024;
    const sizes = ["MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  _hideEulaWarningTimer = null;
  _showEulaWarning() {
    this.querySelector(".spectrum-Tooltip--eulaWarning").classList.add(
      "is-open"
    );

    clearTimeout(this._hideEulaWarningTimer);
    this._hideEulaWarningTimer = setTimeout(() => {
      this.querySelector(".spectrum-Tooltip--eulaWarning").classList.remove(
        "is-open"
      );
      this._hideEulaWarningTimer = null;
    }, 3000);
  }

  _handleDownloadClick = (ev) => {
    const eulaChecked = this.querySelector("input#checkbox-AcceptEULA");
    if (!eulaChecked.checked) {
      this._showEulaWarning();
      ev.preventDefault();
      return;
    }
  };

  _handleShareUrlClick = () => {
    const packageName = this.packageDetails?.packageName || "";

    const _copyToClipboard = (str) => {
      if (!str) {
        return;
      }
      const el = document.createElement("textarea");
      el.value = str;
      el.setAttribute("readonly", "");
      el.style = { position: "absolute", left: "-9999px" };
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    };
    const _showTooltip = () => {
      const toolTip = document.querySelector(".spectrum-Tooltip--share");
      toolTip.classList.add("is-open");
      setTimeout(() => {
        toolTip.classList.remove("is-open");
      }, 1000);
    };

    const url = new URL(document.location.href);
    url.searchParams.set("package", packageName);
    _copyToClipboard(url.toString());
    _showTooltip();
  };

  _showTab(tabName) {
    const tab = this.querySelector(
      `.spectrum-Tabs-item[data-tab="${tabName}"]`
    );
    if (!tab) {
      return;
    }

    const tabContent = this.querySelector(
      `.spectrum-TabView-body[data-tab="${tabName}"]`
    );
    this.querySelectorAll(".spectrum-Tabs-item").forEach((tab) => {
      tab.classList.remove("is-selected");
      tab.setAttribute("aria-selected", false);
      tab.setAttribute("tabindex", -1);
    });
    this.querySelectorAll(".spectrum-TabView-body").forEach((tab) => {
      tab.classList.add("hidden");
    });
    tab.classList.add("is-selected");
    tab.setAttribute("aria-selected", true);
    tab.setAttribute("tabindex", 0);
    tabContent.classList.remove("hidden");
    const selectionIndicator = this.querySelector(
      ".spectrum-Tabs-selectionIndicator"
    );

    selectionIndicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    selectionIndicator.style.width = `${tab.offsetWidth}px`;
  }

  _handleTabClick = (ev) => {
    const element = ev.target.closest("[data-tab]");
    if (!element) {
      return;
    }
    this._showTab(element.dataset.tab);
  };

  _renderModalContents() {
    if (!this.packageDetails) {
      return html`<div class="spectrum-Dialog-grid"></div>`;
    }

    return html` <div class="spectrum-Dialog-grid">
      <h1 class="spectrum-Dialog-heading spectrum-Dialog-heading--noHeader">
        ${this.packageDetails?.packageName}
      </h1>
      <hr
        class="spectrum-Divider spectrum-Divider--sizeM spectrum-Divider--horizontal spectrum-Dialog-divider"
      />
      <section class="spectrum-Dialog-content">
        <div
          class="spectrum-Tabs spectrum-Tabs--sizeM spectrum-Tabs--horizontal spectrum-Tabs--compact spectrum-Tabs--quiet"
          aria-orientation="horizontal"
          role="tablist"
        >
          <div
            class="spectrum-Tabs-item is-selected"
            aria-controls="dialog-tab-panels"
            id="tab-Details"
            role="tab"
            aria-selected="true"
            tabindex="0"
            data-tab="details"
            @click=${this._handleTabClick}
          >
            <span class="spectrum-Tabs-itemLabel">Details</span>
          </div>
          <div
            class="spectrum-Tabs-item"
            aria-controls="dialog-tab-panels"
            id="tab-Eula"
            role="tab"
            aria-selected="false"
            tabindex="-1"
            data-tab="eula"
            @click=${this._handleTabClick}
          >
            <span class="spectrum-Tabs-itemLabel">EULA</span>
          </div>
          <div
            class="spectrum-Tabs-item"
            aria-controls="dialog-tab-panels"
            id="tab-ReleaseNotes"
            role="tab"
            aria-selected="false"
            tabindex="-1"
            data-tab="releasenotes"
            @click=${this._handleTabClick}
          >
            <span class="spectrum-Tabs-itemLabel">Release Notes</span>
          </div>
          <div
            class="spectrum-Tabs-selectionIndicator"
            role="presentation"
            style="transform: translateX(0); width: 44px"
          ></div>
        </div>
        <div class="tabs-content" role="tabpanel" id="dialog-tab-panels">
          <div
            class="spectrum-TabView-body spectrum-Details"
            aria-labelledby="tab-Details"
            role="tabpanel"
            data-tab="details"
          >
            <div class="spectrum-DetailsInfo">
              <dt>Description</dt>
              <dd>${this.packageDetails?.description}</dd>
              <dt>Package type</dt>
              <dd>${this.packageDetails?.softwareType}</dd>
              <dt>File type</dt>
              <dd>${this.packageDetails?.fileType}</dd>
              <dt>Provider</dt>
              <dd>${this.packageDetails?.provider}</dd>
              <dt>Size</dt>
              <dd>${this._formatPackageSize(this.packageDetails?.size)}</dd>
              <dt>Operating system</dt>
              <dd>${this.packageDetails?.operatingSystem}</dd>
              <dt>SHA-1 Hash</dt>
              <dd>${this.packageDetails?.sha1Hash}</dd>
            </div>

            <div class="spectrum-DetailsPicture">
              <div class="spectrum-DetailsPicture--image">
                <img
                  class="spectrum-Asset-image"
                  alt="${this.packageDetails?.packageName}"
                  src="/icons/thumbnails/${this.packageDetails?.icon}"
                />
              </div>
            </div>
          </div>
          <div
            class="spectrum-TabView-body spectrum-EulaTerms hidden"
            aria-labelledby="tab-Eula"
            role="tabpanel"
            data-tab="eula"
          >
            <div
              name="field"
              class="spectrum-Body spectrum-Body--sizeS textfieldlike"
            >
              ${unsafeHTML(this.eula)}
            </div>
          </div>
          <div
            class="spectrum-TabView-body spectrum-ReleaseNotes hidden"
            aria-labelledby="tab-ReleaseNotes"
            role="tabpanel"
            data-tab="releasenotes"
          >
            <div class="spectrum-Body spectrum-Body--sizeS textfieldlike">
              ${this.packageDetails.releaseNotes}
            </div>
          </div>
        </div>
      </section>

      <div
        class="spectrum-ButtonGroup spectrum-Dialog-buttonGroup spectrum-Dialog-buttonGroup--noFooter sd-PackageFooterSection"
      >
        <div class="sd-PackageFooter">
          <div class="spectrum-AcceptEULA">
            <label
              class="spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-Checkbox--emphasized"
            >
              <input
                type="checkbox"
                class="spectrum-Checkbox-input"
                id="checkbox-AcceptEULA"
              />
              <span class="spectrum-Checkbox-box">
                <svg
                  class="spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path
                    d="M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1 1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712 6A.999.999 0 0 1 3.788 9z"
                    class="spectrum-UIIcon--medium"
                  ></path>
                  <path
                    d="M4.5 11a.999.999 0 0 1-.788-.385l-3-4a1 1 0 1 1 1.576-1.23L4.5 8.376l5.212-6.99a1 1 0 1 1 1.576 1.23l-6 8A.999.999 0 0 1 4.5 11z"
                    class="spectrum-UIIcon--large"
                  ></path>
                </svg>
              </span>
              <span class="spectrum-Checkbox-label">Accept&nbsp;</span>
            </label>
            <a
              href="#"
              class="spectrum-Link spectrum-Link--sizeM"
              data-tab="eula"
              @click=${this._handleTabClick}
              >EULA Terms</a
            >
            <span
              class="spectrum-Tooltip spectrum-Tooltip--right spectrum-Tooltip--negative spectrum-Tooltip--eulaWarning"
            >
              <span class="spectrum-Tooltip-label"
                >You need to accept the EULA terms</span
              >
              <span class="spectrum-Tooltip-tip"></span>
            </span>
          </div>

          <div class="sd-PackageFooter-Actions">
            <button
              class="spectrum-Button spectrum-Button--outline spectrum-Button--primary spectrum-Button--sizeM spectrum-BackButton"
              @click=${this.close}
            >
              <span class="spectrum-Button-label">Cancel</span>
            </button>
            <div class="spectrum-Button--share">
              <span
                class="spectrum-Tooltip spectrum-Tooltip--top spectrum-Tooltip--share"
              >
                <span class="spectrum-Tooltip-label">Copied URL</span>
                <span class="spectrum-Tooltip-tip"></span>
              </span>
              <button
                class="spectrum-Button spectrum-Button--outline spectrum-Button--primary spectrum-Button--sizeM spectrum-ShareButton"
                @click=${this._handleShareUrlClick}
              >
                <span class="spectrum-Button-label">Share</span>
              </button>
            </div>
            <div class="spectrum-DownloadPackage">
              <a
                @click=${this._handleDownloadClick}
                class="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM spectrum-DownloadButton"
                href="${this.packageDetails.publicLink}"
                target="_blank"
              >
                <span class="spectrum-Button-label">Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  render() {
    return html`
      <div
        class="spectrum-Underlay"
        id="spectrum-Underlay"
        @click=${this.close}
      ></div>
      <div class="spectrum-Modal-wrapper">
        <div class="spectrum-Modal" data-testid="modal">
          <section
            class="spectrum-Dialog spectrum-Dialog--large"
            role="alertdialog"
            tabindex="-1"
            aria-modal="true"
          >
            ${this._renderModalContents()}
          </section>
        </div>
      </div>
    `;
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define("sd-dialog", Dialog);

export default function decorateDialog(block) {
  const dialog = document.createElement("sd-dialog");
  block.innerHTML = "";
  block.appendChild(dialog);
}
