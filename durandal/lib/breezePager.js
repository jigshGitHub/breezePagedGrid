﻿/******************************************************************************
*   breezePagerGrid and breezePager objects
*   Implementation listed below is for use with KnockoutJS framework.
*
*
*   Date:   03/27/2013
*   Author: Josh Garverick
*
*	Revisions:
* 	05-03-2013	JMG		Refactored the breezePagedGrid viewmodel to allow for 
*						easier non-DurandalJS use.  Augmented the constructor to
*						accept a contextUrl (for the Breeze controller being used)
*						and the entitySet, or name of the method on the controller
*						to be called.
*						Also added the SetManager and SetQuery methods, which create new
*						EntityManager or EntityQuery objects, depending on what you need.
******************************************************************************/
	function breezePagedGrid(contextUrl, entitySet) {
        var self = this;
        self.Pager = ko.observable(new breezePager());
        self.Results = ko.observableArray([]);
        self.Columns = ko.observableArray([]);
        self.Query = null;
        self.Manager = null;
        self.Pager().refreshData = function () {
            self.GetData();
        };

        //#region Event Handling
        self.Success = function (data) {
            self.Results([]);
            self.Results(data.results);
            self.Pager().recordCount(data.inlineCount);
        };
        self.Fail = function (err) {
            alert(err);
        };
        //#endregion

        //#region Data Handling
        self.DataPromise = function () {
            // This is where you override to pass in the executeQuery call, if necessary
            return self.Manager.executeQuery(self.Query.skip(self.Pager().skipItems()).take(parseInt(self.Pager().itemsPerPage())));
        };

        self.GetData = function () {
            self.DataPromise().then(self.Success).fail(self.Fail);
        };

        self.AddColumn = function (header, field, controlType, keyField, navLink) {
            self.Columns.push(new breezeGridColumn(header, field, controlType, keyField, navLink));
        };
        //#endregion

        self.Init = function () {
            
            if (self.Columns().length > 0) {
                self.Columns([]);
            }
            self.Pager().pageNumber(1);
        };

        self.SetManager = function (contextUrl) {
            if (contextUrl && contextUrl.length > 0) {
                self.Manager = new breeze.EntityManager(contextUrl);
            }
        };

        self.SetQuery = function (entitySet) {
            if (entitySet && entitySet.length > 0) {
                self.Query = new breeze.EntityQuery()
                                .from(entitySet).inlineCount(true);
            }
        };

        self.SetManager(contextUrl);
        self.SetQuery(entitySet);
        self.Init();
        
    }
    /******************************************************************************
    *   Model for the pager object
    ******************************************************************************/
    function breezePager() {
    var self = this;
        self.recordCount= ko.observable(0);
        self.itemsPerPage = ko.observable('25');
        self.pageNumber = ko.observable(1);
        self.refreshData = function () {
        };
        self.maxPages = ko.computed(function () {
            return parseInt(self.recordCount() / parseInt(self.itemsPerPage())) + 1;
        });
        self.skipItems = ko.computed(function () {
            return (parseInt(self.pageNumber()) - 1) * parseInt(self.itemsPerPage());
        });

        //#region Paging Operations
        self.nextPage = function () {
            if (self.pageNumber() < self.maxPages()) {
                self.pageNumber(self.pageNumber() + 1);
            }
        };
        self.previousPage = function () {
            if (self.pageNumber() > 1) {
                self.pageNumber(self.pageNumber() - 1);
            }
        };
        self.firstPage = function () {
            self.pageNumber(1);
        };
        self.lastPage = function () {
            self.pageNumber(self.maxPages());
        };
        //#endregion

        //#region Observable Subscriptions
        self.pageNumber.subscribe(function (newValue) {
            self.refreshData();
        });
        self.itemsPerPage.subscribe(function (newValue) {
            self.refreshData();
            if (self.pageNumber() > self.maxPages()) {
                self.pageNumber(1);
            }
        });
        //#endregion
    };
    /******************************************************************************
    *   Model for the grid column(s)
    ******************************************************************************/
    function breezeGridColumn(header, field, controlType, keyField, navLink) {
        var self = this;
        self.ColumnHeader = ko.observable('');
        self.FieldName = ko.observable('');
        self.DisplayControlType = ko.observable('cell');
        self.KeyField = ko.observable('');
        self.NavLink = ko.observable('');

        if (header) {
            self.ColumnHeader(header);
        }
        if (field) {
            self.FieldName(field);
        }
        if (controlType) {
            self.DisplayControlType(controlType);
        }
        if (keyField) {
            self.KeyField(keyField);
        }
        if (navLink) {
            self.NavLink(navLink);
        }
    }
