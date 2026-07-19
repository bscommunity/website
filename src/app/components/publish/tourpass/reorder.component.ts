// CDK
import {
    CdkDrag,
    type CdkDragDrop,
    CdkDragHandle,
    CdkDropList,
    moveItemInArray,
} from "@angular/cdk/drag-drop";
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    ViewEncapsulation,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
// Material
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from "@angular/material/dialog";
import { NgGlyph } from "@ng-icons/core";
import type { ChartModel } from "@/models/chart.model";
import type { TourPassFormData } from "@/services/publish/handlers/tourpass-publish.handler";
// Types
import type { DialogData } from "@/services/publish/publish.service";
// Components
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

@Component({
    selector: "app-publish-tourpass-reorder",
    // Needed because CDK teleports the drag preview/placeholder outside this
    // component's DOM (into an overlay attached to <body>), so Angular's
    // normal emulated style scoping can't reach it. We scope manually below
    // instead by prefixing every rule with the "tp-reorder" classes, which
    // CDK carries over onto the cloned preview element.
    encapsulation: ViewEncapsulation.None,
    template: `
        <h2 mat-dialog-title>Reorder</h2>
        <form (ngSubmit)="onSubmit()">
            <mat-dialog-content class="mat-typography flex! flex-col gap-4">
                <p>Order the charts in the way you think best suits the vibe</p>

                @if (selectedCharts.length === 0) {
                    <p class="text-center text-sm text-on-surface-variant">
                        No charts selected.
                    </p>
                } @else {
                    <div
                        cdkDropList
                        class="tp-reorder-list flex flex-col gap-3"
                        (cdkDropListDropped)="drop($event)"
                    >
                        @for (
                            chart of selectedCharts;
                            track chart.id;
                            let i = $index
                        ) {
                            <div
                                cdkDrag
                                cdkDragLockAxis="y"
                                class="tp-reorder-item"
                            >
                                <app-chart-preview
                                    [chart]="chart"
                                    size="sm"
                                    variant="static"
									[showItems]="[]"
                                    [fullWidth]="true"
                                >
                                    <div
                                        chartAction
                                        class="flex items-center gap-2 pl-1"
                                    >
                                        <span class="tp-reorder-badge">{{
                                            i + 1
                                        }}</span>
                                        <button
                                            type="button"
                                            cdkDragHandle
                                            class="tp-reorder-handle"
                                            aria-label="Drag to reorder"
                                        >
                                            <ng-glyph name="drag_indicator" />
                                        </button>
                                    </div>
                                </app-chart-preview>
                            </div>
                        }
                    </div>
                }
            </mat-dialog-content>
            <mat-dialog-actions align="end">
                <button
                    mat-button
                    type="button"
                    (click)="dialogRef.close('back')"
                >
                    Back
                </button>
                <button
                    mat-button
                    type="submit"
                    [disabled]="selectedCharts.length === 0"
                >
                    Continue
                </button>
            </mat-dialog-actions>
        </form>
    `,
    styles: [
        `
        /* Every non-dragged item eases into its new slot instead of jumping */
        .tp-reorder-item {
            transition: transform 50ms cubic-bezier(0, 0, 0.2, 1);
        }

        /* CDK adds this class to items animating back into place after drop */
        .tp-reorder-item.cdk-drag-animating {
            transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
        }

        /* The item actually being dragged shouldn't ease (it should track the pointer 1:1) */
        .tp-reorder-item.cdk-drag-dragging {
            transition: none;
        }

        /*
         * The floating "ghost" that follows the pointer.
         * Scoped via .tp-reorder-item because CDK clones the source
         * element's classes onto the preview node.
         */
        .tp-reorder-item.cdk-drag-preview {
            /* box-sizing: border-box;
            border-radius: 0.75rem;
            box-shadow:
                0 12px 24px -6px rgba(0, 0, 0, 0.35),
                0 4px 8px -2px rgba(0, 0, 0, 0.2);
            transform: scale(1.03) rotate(1deg); */
            letter-spacing: 0.5px;
            opacity: 0.96;
            z-index: 1000;
        }

        /*
         * The empty slot left behind, shown where the item will drop.
         * This is CDK's *default* placeholder — an exact clone of the
         * dragged element — so its size always matches reality with no
         * guessing (unlike a custom *cdkDragPlaceholder with a fixed
         * height, which drifts out of sync and causes a layout shift).
         * We just hide its cloned content and draw a dashed outline on
         * top, sized automatically to whatever height it already has.
         */
        .tp-reorder-item.cdk-drag-placeholder {
            position: relative;
        }

        .tp-reorder-item.cdk-drag-placeholder > * {
            visibility: hidden;
        }

        .tp-reorder-item.cdk-drag-placeholder::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 0.75rem;
            border: 2px dashed color-mix(in srgb, currentColor 25%, transparent);
            background: color-mix(in srgb, currentColor 4%, transparent);
        }

        /*
         * Dim every OTHER item slightly while a drag is in progress, so the
         * item actually being moved reads as the clear focus of attention.
         * (The placeholder is excluded since it already has its own
         * dashed-outline treatment above.)
         */
        .tp-reorder-list.cdk-drop-list-dragging
            .tp-reorder-item:not(.cdk-drag-placeholder) {
            transition:
                transform 250ms cubic-bezier(0, 0, 0.2, 1),
                opacity 150ms ease;
            opacity: 0.55;
        }

        .tp-reorder-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.75rem;
            height: 1.75rem;
            border-radius: 9999px;
            background: color-mix(in srgb, currentColor 8%, transparent);
            font-size: 0.75rem;
            font-variant-numeric: tabular-nums;
            font-weight: 500;
            flex-shrink: 0;
        }

        .tp-reorder-handle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.25rem;
            height: 2.25rem;
            border-radius: 9999px;
            border: none;
            background: transparent;
            color: inherit;
            cursor: grab;
            touch-action: none;
            transition: background-color 150ms ease;
        }

        .tp-reorder-handle:hover {
            background: color-mix(in srgb, currentColor 8%, transparent);
        }

        .tp-reorder-handle:active,
        .cdk-drag-dragging .tp-reorder-handle {
            cursor: grabbing;
        }

        /*
         * Custom button element, so we don't inherit Material's built-in
         * focus ring — without this, tabbing to the handle on a keyboard
         * leaves no visible indicator at all.
         */
        .tp-reorder-handle:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
        }
        `,
    ],
    imports: [
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        NgGlyph,
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        ChartPreviewComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTourPassReorderComponent {
    dialogRef =
        inject<MatDialogRef<PublishTourPassReorderComponent>>(MatDialogRef);
    data = inject<DialogData<TourPassFormData>>(MAT_DIALOG_DATA);

    selectedCharts: ChartModel[] = [
        ...(this.data.formData.selectedCharts || []),
    ];

    drop(event: CdkDragDrop<ChartModel[]>) {
        moveItemInArray(
            this.selectedCharts,
            event.previousIndex,
            event.currentIndex,
        );
    }

    onSubmit() {
        this.dialogRef.close({
            chartIds: this.selectedCharts.map((chart) => chart.id),
            selectedCharts: [...this.selectedCharts],
        });
    }
}