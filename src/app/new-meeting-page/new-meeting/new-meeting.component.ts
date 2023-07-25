import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BaseFormComponent } from '../../base-form/base-form.component';
import { TimeType, FileType } from '../../shared/enums';
import { DownloadFile } from '../../shared/interfaces';
import { FileDownloadService } from '../../services/file-download.service';
import { FormValidators } from 'src/app/shared/formValidators.directive';

@Component({
  selector: 'app-new-meeting',
  templateUrl: './new-meeting.component.html',
  styleUrls: ['./new-meeting.component.css'],
})
export class NewMeetingComponent extends BaseFormComponent implements OnInit {
  @ViewChild('chooseFile ') chooseFileInput !: ElementRef;
  @ViewChild('addDocument  ') addDocumentInput !: ElementRef;

  public FileType = FileType;

  public selectedMeetingType!: FormControl;
  public meetingName!: FormControl;
  private dateStart: Date;
  private dateEnd: Date;
  public TimeType = TimeType;
  public dateSelected!: FormControl;
  public dateStartControl!: FormControl;
  public dateEndControl!: FormControl;
  public meetingAddress!: FormControl;
  public onlineAddress!: FormControl;
  private hybridType!: FormControl;
  public isHybrideChecked!: boolean;
  public isAddressChecked!: boolean;
  public isOnlineChecked!: boolean;
  private choosedFileControl!: FormControl;
  private addedDocumentControl!: FormControl;
  public addedDocumentFormArray!: FormArray;

  constructor(private fileDownloadService: FileDownloadService) {
    super();
    this.dateStart = new Date();
    this.dateEnd = new Date();
  }

  ngOnInit() {
    this.meetingAddress.setValue('online');
    this.createFormControls();
    this.meetingAddress.disable();
    this.onlineAddress.disable();

  }

  createFormControls(): void {
    this.selectedMeetingType = new FormControl('', [Validators.required]);
    this.meetingName = new FormControl();
    this.meetingAddress = new FormControl({ value: '', disabled: true });
    this.dateSelected = new FormControl();
    this.dateStartControl = new FormControl('', [Validators.required])
    this.dateEndControl = new FormControl('', [Validators.required])
    this.meetingAddress = new FormControl();
    this.onlineAddress = new FormControl();
    this.hybridType = new FormControl();
    this.choosedFileControl = new FormControl();
    this.addedDocumentControl = new FormControl();
    this.addedDocumentFormArray = new FormArray<FormControl>([]);
    this.form = new FormGroup({
      selectedMeetingType: this.selectedMeetingType,
      meetingName: this.meetingName,
      dateStart: this.dateStartControl,
      dateEnd: this.dateEndControl,
      meetingAddress: this.meetingAddress,
      onlineAddress: this.onlineAddress,
      chooseFile: this.choosedFileControl,
      addedDocuments: this.addedDocumentFormArray,
      hybridType: this.hybridType
    });
    this.formValidators();
  }

  selectType(option: string) {
    if (this.form) {
      this.form.patchValue({
        selectedMeetingType: option
      });
    }
  }

  handleDateSelected(selectedDate: Date) {
    if (selectedDate !== null) {
      this.dateStart.setFullYear(selectedDate.getFullYear());
      this.dateStart.setMonth(selectedDate.getMonth());
      this.dateStart.setDate(selectedDate.getDate());
      this.dateEnd.setFullYear(selectedDate.getFullYear());
      this.dateEnd.setMonth(selectedDate.getMonth());
      this.dateEnd.setDate(selectedDate.getDate());

      this.dateStartControl.setValue(this.dateStart);
      this.dateEndControl.setValue(this.dateEnd);
      this.dateStartControl.markAsDirty()
      this.dateEndControl.markAsDirty()
    }
  }

  handleTimeSelected(time: string, type: TimeType): void {
    const hour = time.split(':')[0];
    const min = time.split(':')[1];
    if (type === TimeType.Start) {
      this.dateStart.setHours(parseInt(hour, 10));
      this.dateStart.setMinutes(parseInt(min, 10));
      this.dateStartControl.setValue(this.dateStart);
    }
    if (type === TimeType.End) {
      this.dateEnd.setHours(parseInt(hour, 10));
      this.dateEnd.setMinutes(parseInt(min, 10));
      this.dateEndControl.setValue(this.dateEnd);
    }
    this.dateStartControl.markAsDirty()
    this.dateEndControl.markAsDirty()
  }

  clearInput() {
    this.meetingName.setValue('');
  }

  toggleAdress() {
    this.meetingAddress.enable();
    this.onlineAddress.disable();
    this.isOnlineChecked = false;
    this.isHybrideChecked = false;
    this.isAddressChecked = !this.isAddressChecked;
    if (this.isAddressChecked === true) {
      this.meetingAddress.enable();
    } else {
      this.meetingAddress.disable();
    }
  }

  toggleOnline() {
    this.meetingAddress.disable();
    this.isAddressChecked = false;
    this.isHybrideChecked = false;
    this.isOnlineChecked = !this.isOnlineChecked;
    if (this.isOnlineChecked === true) {
      this.onlineAddress.enable();
    } else {
      this.onlineAddress.disable();
    }
  }

  toggleHybride() {
    this.isHybrideChecked = !this.isHybrideChecked;
    this.isAddressChecked = false;
    this.isOnlineChecked = false;
    this.meetingAddress.enable()
    this.onlineAddress.enable()
    this.hybridType.setValue(this.isHybrideChecked)
  }

  openFilePicker(inputElement: ElementRef): void {
    inputElement.nativeElement.click();
  }

  onFileSelected(event: Event, type: FileType): void {
    const target = event.target as HTMLInputElement;
    if (target?.files !== null) {
      const selectedFile = target.files[0];
      if (type === FileType.ChooseFile) {
        this.choosedFileControl.setValue(selectedFile);
      }
      if (type === FileType.AddDocument) {
        const addedDocumentControl = new FormControl(selectedFile);
        this.addedDocumentFormArray.push(addedDocumentControl);
      }
    }
  }

  // first version of function to download only a dox
  // downloadDoc(indexDox: number): void {
  //   const fileDocument = this.addedDocumentFormArray.value[indexDox];
  //   if (fileDocument) {
  //     const downloadLink = document.createElement('a');
  //     //downloadLink.href = fileDocument.fileUrl;
  //     downloadLink.download = fileDocument.name;
  //     downloadLink.click();
  //   }
  // }

  downloadFile(doc: DownloadFile): void {
    this.fileDownloadService.downloadFile(doc);
  }

  deleteDocs(docIndex: number) {
    this.addedDocumentFormArray.value.splice(docIndex, 1);
  }

  protected formValidators(): void {
    this.meetingName.setValidators([
      Validators.required,
      FormValidators.notEmpty()
    ]),
      this.dateStartControl.setAsyncValidators([
        FormValidators.startBeforeEnd(this.dateStart, this.dateEnd, this.dateStartControl, this.dateEndControl),
      ]),
      this.dateEndControl.setAsyncValidators([
        FormValidators.startBeforeEnd(this.dateStart, this.dateEnd, this.dateStartControl, this.dateEndControl)
      ]),
      this.dateStartControl.setValidators([
        Validators.required,
      ]),
      this.dateEndControl.setValidators([
        Validators.required,
      ])
      ,
      this.form.setValidators([
        FormValidators.locationValidator(this.isHybrideChecked, this.isAddressChecked, this.isOnlineChecked),
      ])
  }
}
