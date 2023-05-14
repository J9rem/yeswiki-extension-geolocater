/*
 * This file is part of the YesWiki Extension geolocater.
 *
 * Authors : see README.md file that was distributed with this source code.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

typeUserAttrs.map = {
    name_latitude: { label: _t('BAZ_FORM_EDIT_MAP_LATITUDE'), value: 'bf_latitude' },
    name_longitude: { label: _t('BAZ_FORM_EDIT_MAP_LONGITUDE'), value: 'bf_longitude' },
    autocomplete_street: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STREET'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STREET_PLACEHOLDER') },
    autocomplete_street1: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STREET1'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STREET1_PLACEHOLDER') },
    autocomplete_street2: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STREET2'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STREET2_PLACEHOLDER') },
    autocomplete_postalcode: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_POSTALCODE'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_POSTALCODE_PLACEHOLDER') },
    autocomplete_town: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_TOWN'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_TOWN_PLACEHOLDER') },
    autocomplete_county: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_COUNTY'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_COUNTY_PLACEHOLDER') },
    autocomplete_state: { label: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STATE'), value: '', placeholder: _t('BAZ_FORM_EDIT_MAP_AUTOCOMPLETE_STATE_PLACEHOLDER') },
    autocomplete_other: { label: '', value: ''}
};
  
  
yesWikiMapping.map[6] = "autocomplete_other";

var mapAutocompleteUpdate = function (element) {
    const base = $(element).closest(".map-field.form-field")
    if (!$(element).hasClass("initialized")){
        $(element).addClass("initialized");
        if ($(element).val().length == 0){
            let other = mapAutocompleteUpdateExtractFromOther(base)
            switch (element.getAttribute('name')) {
                case 'autocomplete_street':
                    $(element).val(other.street)
                    break;
                case 'autocomplete_street1':
                    $(element).val(other.street1)
                    break;
                case 'autocomplete_street2':
                    $(element).val(other.street2)
                    break;
                case 'autocomplete_county':
                    $(element).val(other.county)
                    break;
                case 'autocomplete_state':
                    $(element).val(other.state)
                    break;
                default:
                    break;
            }
        }
    } else {
        autocompleteUpdateSaveToOther(base)
    }
};

var mapAutocompleteUpdateExtractFromOther = function(base){
    var results = {
        street: '',
        street1: '',
        street2: '',
        county: '',
        state: ''
    }
    const autoCompleteOther = $(base)
        .find("input[type=text][name=autocomplete_other]")
        .first()
    if (autoCompleteOther && autoCompleteOther.length > 0){
        const value = autoCompleteOther.val().split('|')
        results.street = value[1] || ''
        results.street1 = value[2] || ''
        results.street2 = value[3] || ''
        results.county = value[4] || ''
        results.state = value[5] || ''
    }
    return results
}
var autocompleteUpdateSaveToOther = function(base){
    const autoCompleteOther = $(base)
        .find("input[type=text][name=autocomplete_other]")
        .first()
    if (autoCompleteOther && autoCompleteOther.length > 0){
        var results = {
            street: '',
            street1: '',
            street2: '',
            county: '',
            state: ''
        }
        const associations = {
            street: 'autocomplete_street',
            street1: 'autocomplete_street1',
            street2: 'autocomplete_street2',
            county: 'autocomplete_county',
            state: 'autocomplete_state'
        }
        for (const key in associations) {
            const autoCompleteField = $(base)
                .find(`input[type=text][name=${associations[key]}]`)
                .first()
            if (autoCompleteField && autoCompleteField.length > 0){
                results[key] = autoCompleteField.val() || ''
            }
        }
        autoCompleteOther.val(
            `|${results.street}` // compatibility with geolocate
            + `|${results.street1}`
            + `|${results.street2}`
            + `|${results.county}`
            + `|${results.state}`
        )
    }
}

var initMapAutocompleteUpdate = function(){
    $(".map-field.form-field")
    .find("input[type=text][name=autocomplete_street]:not(.initialized)"
        +",input[type=text][name=autocomplete_street1]:not(.initialized)"
        +",input[type=text][name=autocomplete_street2]:not(.initialized)"
        +",input[type=text][name=autocomplete_county]:not(.initialized)"
        +",input[type=text][name=autocomplete_state]:not(.initialized)")
    .change(function(event){mapAutocompleteUpdate(event.target)})
    .trigger('change');
};

templates.map = function(field){
    return {
        field: _t('BAZ_FORM_EDIT_MAP_FIELD'),
        onRender() {
            const toggleState = function (name,state){
                const holder = templateHelper.getHolder(field)
                if (holder) {
                    const formGroup = holder.find(`.${name}-wrap`)
                    if (typeof formGroup !== undefined && formGroup.length > 0) {
                        if (state === 'show'){
                        formGroup.show()
                        } else {
                        formGroup.hide()
                        }
                    }
                }
            }
            const toggleStates = function (state){
              ['autocomplete_street1','autocomplete_street2'].forEach((name)=>toggleState(name,state))
            }
            initMapAutocompleteUpdate()
            templateHelper.prependHTMLBeforeGroup(field, 'autocomplete_street', $('<div/>').addClass('form-group').append($('<center/>').append($('<b/>').append(_t('GEOLOCATER_GROUP_GEOLOCATIZATION')))))
            templateHelper.defineLabelHintForGroup(field, 'autocomplete_street1', _t('GEOLOCATER_OPTIONNAL'))
            templateHelper.prependHTMLBeforeGroup(field, 'autocomplete_street1', $('<div/>').addClass('form-group').append($('<button/>').addClass('btn btn-info btn-xs').append(_t('GEOLOCATER_SEE_ADVANCED_PARAMS')).on(
                'click',
                function (event){
                  if ($(this).hasClass('opened')){
                    $(this).removeClass('opened')
                    $(this).html(_t('GEOLOCATER_SEE_ADVANCED_PARAMS'));
                    toggleStates('hide')
                  } else {
                    $(this).addClass('opened')
                    $(this).html(_t('GEOLOCATER_HIDE_ADVANCED_PARAMS'));
                    toggleStates('show')
                  }
                  event.preventDefault()
                  event.stopPropagation()
                }
              )))
              toggleStates('hide')
            templateHelper.defineLabelHintForGroup(field, 'autocomplete_street2', _t('GEOLOCATER_OPTIONNAL'))
            templateHelper.defineLabelHintForGroup(field, 'autocomplete_county', _t('GEOLOCATER_OPTIONNAL'))
            templateHelper.defineLabelHintForGroup(field, 'autocomplete_state', _t('GEOLOCATER_OPTIONNAL'))
            templateHelper.defineLabelHintForGroup(field, 'autocomplete_town', _t('GEOLOCATER_OPTIONNAL'))
            templateHelper.defineLabelHintForGroup(field, 'autocomplete_postalcode', _t('GEOLOCATER_OPTIONNAL'))
        }
    }
}

