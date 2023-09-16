class GitHubLink extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
	}
	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<style>
				a {
					position: absolute;
					top: 14px;
					right: 14px;
					font-family: sans-serif;
					font-weight: normal;
					font-size: 16px;
					line-height: normal;
					color: blue;
					cursor: pointer;
					overflow: hidden;
					pointer-events: auto;
					text-decoration: none;
					border: 1px solid blue;
					padding: 6px 10px;
					border-radius: 4px;
					background: rgba(255,255,255,0.3);
				}
			</style>
			<a href="${this.getAttribute('href')}">GitHub</a>
		`;
	}
}
customElements.define('github-link', GitHubLink);
