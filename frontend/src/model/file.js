/*

Copyright (c) 2018 - 2020 Michael Mayer <hello@photoprism.org>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    PhotoPrism™ is a registered trademark of Michael Mayer.  You may use it as required
    to describe our software, run your own server, for educational purposes, but not for
    offering commercial goods, products, or services without prior written permission.
    In other words, please ask.

Feel free to send an e-mail to hello@photoprism.org if you have questions,
want to support our work, or just want to say hello.

Additional information can be found in our Developer Guide:
https://docs.photoprism.org/developer-guide/

*/

import RestModel from "model/rest";
import Api from "common/api";
import {DateTime} from "luxon";
import Util from "common/util";
import {config} from "../session";

export class File extends RestModel {
    getDefaults() {
        return {
            InstanceID: "",
            UID: "",
            PhotoUID: "",
            Root: "",
            Name: "",
            OriginalName: "",
            Hash: "",
            Modified: "",
            Size: 0,
            Codec: "",
            Type: "",
            Mime: "",
            Primary: false,
            Sidecar: false,
            Missing: false,
            Duplicate: false,
            Portrait: false,
            Video: false,
            Duration: 0,
            Width: 0,
            Height: 0,
            Orientation: 0,
            AspectRatio: 1.0,
            MainColor: "",
            Colors: "",
            Luminance: "",
            Diff: 0,
            Chroma: 0,
            Notes: "",
            Error: "",
            CreatedAt: "",
            CreatedIn: 0,
            UpdatedAt: "",
            UpdatedIn: 0,
            DeletedAt: "",
        };
    }

    baseName(truncate) {
        let result = this.Name;
        const slash = result.lastIndexOf("/");

        if (slash >= 0) {
            result = this.Name.substring(slash + 1);
        }

        if (truncate) {
            result = Util.truncate(result, truncate, "...");
        }

        return result;
    }

    isFile() {
        return true;
    }

    getEntityName() {
        return this.Root + "/" + this.Name;
    }

    thumbnailUrl(type) {
        if (this.Error) {
            return "/api/v1/svg/broken";
        } else if (this.Type === "raw") {
            return "/api/v1/svg/raw";
        }

        return `/api/v1/t/${this.Hash}/${config.previewToken()}/${type}`;
    }

    getDownloadUrl() {
        return "/api/v1/dl/" + this.Hash + "?t=" + config.downloadToken();
    }

    download() {
        if (!this.Hash) {
            console.warn("no file hash found for download", this);
            return;
        }

        let link = document.createElement("a");
        link.href = this.getDownloadUrl();
        link.download = this.baseName(this.Name);
        link.click();
    }

    thumbnailSrcset() {
        const result = [];

        result.push(this.thumbnailUrl("fit_720") + " 720w");
        result.push(this.thumbnailUrl("fit_1280") + " 1280w");
        result.push(this.thumbnailUrl("fit_1920") + " 1920w");
        result.push(this.thumbnailUrl("fit_2560") + " 2560w");
        result.push(this.thumbnailUrl("fit_3840") + " 3840w");

        return result.join(", ");
    }

    calculateSize(width, height) {
        if (width >= this.Width && height >= this.Height) { // Smaller
            return {width: this.Width, height: this.Height};
        }

        const srcAspectRatio = this.Width / this.Height;
        const maxAspectRatio = width / height;

        let newW, newH;

        if (srcAspectRatio > maxAspectRatio) {
            newW = width;
            newH = Math.round(newW / srcAspectRatio);

        } else {
            newH = height;
            newW = Math.round(newH * srcAspectRatio);
        }

        return {width: newW, height: newH};
    }

    thumbnailSizes() {
        const result = [];

        result.push("(min-width: 2560px) 3840px");
        result.push("(min-width: 1920px) 2560px");
        result.push("(min-width: 1280px) 1920px");
        result.push("(min-width: 720px) 1280px");
        result.push("720px");

        return result.join(", ");
    }

    getDateString() {
        return DateTime.fromISO(this.CreatedAt).toLocaleString(DateTime.DATETIME_MED);
    }

    getInfo() {
        let info = [];

        if (this.Type) {
            info.push(this.Type.toUpperCase());
        }

        if (this.Duration > 0) {
            info.push(Util.duration(this.Duration));
        }

        this.addSizeInfo(info);

        return info.join(", ");
    }

    typeInfo() {
        if (this.Video) {
            return "Video";
        } else if (this.Sidecar) {
            return "Sidecar";
        }

        return this.Type.toUpperCase();
    }

    sizeInfo() {
        let info = [];

        this.addSizeInfo(info);

        return info.join(", ");
    }

    addSizeInfo(info) {
        if (this.Width && this.Height) {
            info.push(this.Width + " × " + this.Height);
        }

        if (this.Size > 102400) {
            const size = Number.parseFloat(this.Size) / 1048576;

            info.push(size.toFixed(1) + " MB");
        } else if (this.Size) {
            const size = Number.parseFloat(this.Size) / 1024;

            info.push(size.toFixed(1) + " KB");
        }
    }

    toggleLike() {
        this.Favorite = !this.Favorite;

        if (this.Favorite) {
            return Api.post(this.getPhotoResource() + "/like");
        } else {
            return Api.delete(this.getPhotoResource() + "/like");
        }
    }

    getPhotoResource() {
        return "photos/" + this.PhotoUID;
    }

    like() {
        this.Favorite = true;
        return Api.post(this.getPhotoResource() + "/like");
    }

    unlike() {
        this.Favorite = false;
        return Api.delete(this.getPhotoResource() + "/like");
    }

    static getCollectionResource() {
        return "files";
    }

    static getModelName() {
        return "File";
    }
}

export default File;
