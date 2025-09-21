import { Component, inject } from '@angular/core'
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
	selector: 'app-image-viewer',
	standalone: true,
	imports: [MatDialogModule],
	templateUrl: './image-viewer.dialog.html',
	styleUrl: './image-viewer.dialog.scss',
})
export class ImageViewerDialog {
	data = inject(MAT_DIALOG_DATA) as { src: string; alt?: string }
	ref = inject(MatDialogRef<ImageViewerDialog>)
}
