import {
    ChangeDetectionStrategy,
    Component,
    input,
    inject,
} from "@angular/core";
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { MatAnchor, MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-connection-panel",
    templateUrl: "./connection-panel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIcon, NgGlyph, MatButtonModule, MatAnchor],
})
export class ConnectionPanelComponent {
}
