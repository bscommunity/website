import {
    Component,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";

//Components
import { PublicHeaderComponent } from "@/components/public-header/public-header.component";
import { FooterComponent } from "@/components/footer/footer.component";

@Component({
    selector: "app-public-layout",
    imports: [PublicHeaderComponent, FooterComponent, RouterOutlet],
    template: `
        <app-public-header></app-public-header>
            <main>
                <router-outlet></router-outlet>
            </main>
        <app-footer></app-footer>
    `
})
export class PublicLayoutComponent { }