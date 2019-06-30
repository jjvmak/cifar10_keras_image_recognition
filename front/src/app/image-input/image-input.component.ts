import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.css']
})
export class ImageInputComponent implements OnInit {
  public imagePath;
  imgURL: any;
  public message: string;
  showResultArea: boolean;
  resultLabel: string;

  constructor(private http: HttpClient) { }

  preview(files) {
    this.showResultArea = false;
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.';
      this.showResultArea = false;
      return;
    } else {
      this.message = '';
    }

    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.imgURL = reader.result;
      let imageEnc = this.imgURL.toString();
      imageEnc = imageEnc.replace('data:image/png;base64,', '');
      this.showResultArea = true;
      const body = {
        image: imageEnc
      };
      this.http.post('http://127.0.0.1:5000/image', body, {observe : 'response'})
        .subscribe(resp => {
          const obj: Result = JSON.parse(JSON.stringify(resp.body));
          console.log(obj.msg);
          this.resultLabel = obj.msg;
      });
    };



  }

  ngOnInit(): void {
  }
}

interface Result {
  msg: string;
}
