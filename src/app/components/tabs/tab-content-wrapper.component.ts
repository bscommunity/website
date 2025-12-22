import { Component } from "@angular/core";

@Component({
	selector: "app-tab-content-wrapper",
	template: `
		<section class="flex flex-col items-center justify-start w-full">
			<ng-content></ng-content>
		</section>
	`,
	styles: [
		`
			:host.slide-in-left {
				animation: slideInLeft 200ms ease;
			}

			@keyframes slideInLeft {
				from {
					transform: translateX(-30px);
					opacity: 0;
				}
				to {
					transform: translateX(0);
					opacity: 1;
				}
			}

			:host.slide-out-left {
				animation: slideOutLeft 200ms ease;
			}

			@keyframes slideOutLeft {
				from {
					transform: translateX(0);
					opacity: 1;
				}
				to {
					transform: translateX(-30px);
					opacity: 0;
				}
			}

			:host.slide-in-right {
				animation: slideInRight 200ms ease;
			}

			@keyframes slideInRight {
				from {
					transform: translateX(30px);
					opacity: 0;
				}
				to {
					transform: translateX(0);
					opacity: 1;
				}
			}

			:host.slide-out-right {
				animation: slideOutRight 200ms ease;
			}

			@keyframes slideOutRight {
				from {
					transform: translateX(0);
					opacity: 1;
				}
				to {
					transform: translateX(30px);
					opacity: 0;
				}
			}

			:host.fade-in {
				animation: fadeIn 200ms ease;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			:host.fade-out {
				animation: fadeOut 200ms ease;
			}

			@keyframes fadeOut {
				from {
					opacity: 1;
				}
				to {
					opacity: 0;
				}
			}
		`,
	],
})
export class TabContentWrapperComponent {}
