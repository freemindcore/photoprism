import Rest from "model/rest";
import Album from "model/album";
import Label from "model/label";
import MockAdapter from "axios-mock-adapter";
import Api from "common/api";

let chai = require('../../../node_modules/chai/chai');
let assert = chai.assert;

describe("model/abstract", () => {
    const mock = new MockAdapter(Api);
    it("should set values",  () => {
        const values = {id: 5, Name: "Black Cat", Slug: "black-cat"};
        const label = new Label(values);
        assert.equal(label.Name, "Black Cat");
        assert.equal(label.Slug, "black-cat");
        label.setValues();
        assert.equal(label.Name, "Black Cat");
        assert.equal(label.Slug, "black-cat");
        const values2 = {id: 6, Name: "White Cat", Slug: "white-cat"};
        label.setValues(values2);
        assert.equal(label.Name, "White Cat");
        assert.equal(label.Slug, "white-cat");
    });

    it("should get values",  () => {
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019", UID: 66};
        const album = new Album(values);
        const result = album.getValues();
        assert.equal(result.Name, "Christmas 2019");
        assert.equal(result.UID, 66);
    });

    it("should get id",  () => {
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019", UID: 66};
        const album = new Album(values);
        const result = album.getId();
        assert.equal(result, 66);
    });

    it("should test if id exists",  () => {
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019", UID: 66};
        const album = new Album(values);
        const result = album.hasId();
        assert.equal(result, true);
    });

    it("should get model name",  () => {
        const result = Rest.getModelName();
        assert.equal(result, "Item");
    });

    it("should update album",  async() => {
        mock.onPut().reply(200, {Description: "Test description"});
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019", UID: 66};
        const album = new Album(values);
        assert.equal(album.Description, undefined);
        await album.update();
        assert.equal(album.Description, "Test description");
        mock.reset();
    });

    it("should save album",  async() => {
        mock.onPut().reply(200, {Description: "Test description"});
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019", UID: 66};
        const album = new Album(values);
        assert.equal(album.Description, undefined);
        await album.save();
        assert.equal(album.Description, "Test description");
        mock.reset();
    });

    it("should save album",  async() => {
        mock.onPost().reply(200, {Description: "Test description"});
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019"};
        const album = new Album(values);
        assert.equal(album.Description, undefined);
        await album.save();
        assert.equal(album.Description, "Test description");
        mock.reset();
    });

    it("should remove album",  async() => {
        mock.onDelete().reply(200);
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019"};
        const album = new Album(values);
        assert.equal(album.Name, "Christmas 2019");
        await album.remove();
        mock.reset();
    });

    it("should get edit form",  async() => {
        mock.onAny().reply(200, "editForm");
        const values = {id: 5, Name: "Christmas 2019", Slug: "christmas-2019"};
        const album = new Album(values);
        const result = await album.getEditForm();
        assert.equal(result.definition, "editForm");
        mock.reset();
    });

    it("should get create form",  async() => {
        mock.onAny().reply(200, "createForm");
        const result = await Album.getCreateForm();
        assert.equal(result.definition, "createForm");
        mock.reset();
    });

    it("should get search form",  async() => {
        mock.onAny().reply(200, "searchForm");
        const result = await Album.getSearchForm();
        assert.equal(result.definition, "searchForm");
        mock.reset();
    });

    it("should search label",  async() => {
        mock.onAny().reply(200, {"ID":51,"CreatedAt":"2019-07-03T18:48:07Z","UpdatedAt":"2019-07-25T01:04:44Z","DeletedAt":"0001-01-01T00:00:00Z","Slug":"tabby-cat","Name":"tabby cat","Priority":5,"LabelCount":9,"Favorite":false,"Description":"","Notes":""});
        const result = await Album.search();
        assert.equal(result.data.ID, 51);
        assert.equal(result.data.Name, "tabby cat");
        mock.reset();
    });

    it("should get collection resource",  () => {
        assert.equal(Rest.getCollectionResource(), "");
    });
});
