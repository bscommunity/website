import {
    Component,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";

//Components
import { HeaderComponent } from "@/components/header/header.component";
import { FooterComponent } from "@/components/footer/footer.component";

@Component({
    selector: "app-dashboard-layout",
    imports: [HeaderComponent, FooterComponent, RouterOutlet],
    template: `
        <app-header></app-header>
            <main>
                <router-outlet></router-outlet>
            </main>
        <app-footer></app-footer>
    `
})
export class DashboardLayoutComponent { }