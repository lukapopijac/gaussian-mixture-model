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
					top: 12px;
					right: 12px;
					background-color: #f0f0f0;
					color: #333;
					font-size: 14px;
					padding: 4px 10px;
					border: 1px solid #ccc;
					border-radius: 4px;
					text-align: center;
					text-decoration: none;
					cursor: pointer;
				}
				a:hover {
					background-color: #e0e0e0;
				}
				a:focus {
					outline: none;
					box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
				}
			</style>
			<a href="${this.getAttribute('href')}" target="_blank">GitHub</a>
		`;
	}
}
customElements.define('github-link', GitHubLink);
