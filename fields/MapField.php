<?php

/*
 * This file is part of the YesWiki Extension geolocation.
 *
 * Authors : see README.md file that was distributed with this source code.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 */

namespace YesWiki\Geolocation\Field;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Psr\Container\ContainerInterface;
use YesWiki\Bazar\Field\MapField as BazarMapField;

/**
 * @Field({"map", "carte_google"})
 */
class MapField extends BazarMapField
{
    protected const FIELD_AUTOCOMPLETE_OTHERS = 6;

    public const DEFAULT_FIELDNAME_POSTALCODE = 'bf_code_postal';
    public const DEFAULT_FIELDNAME_STREET = 'bf_adresse';
    public const DEFAULT_FIELDNAME_STREET1 = 'bf_adresse1';
    public const DEFAULT_FIELDNAME_STREET2 = 'bf_adresse2';
    public const DEFAULT_FIELDNAME_TOWN = 'bf_ville';
    public const DEFAULT_FIELDNAME_COUNTY = '';
    public const DEFAULT_FIELDNAME_STATE = 'bf_pays';

    protected $autocompleteFieldnames ;

    public function __construct(array $values, ContainerInterface $services)
    {
        parent::__construct($values, $services);
        $autocomplete = empty($this->autocomplete) ? '' : (
            is_string($this->autocomplete)
            ? $this->autocomplete
            : (
                is_array($this->autocomplete)
                ? implode(',', $this->autocomplete)
                : ''
            )
        );
        $data = array_map('trim', explode(',', $autocomplete));
        $postalCode = empty($data[0]) ? self::DEFAULT_FIELDNAME_POSTALCODE : $data[0];
        $town = empty($data[1]) ? self::DEFAULT_FIELDNAME_TOWN : $data[1];

        $autocompleteFieldnames = empty($values[self::FIELD_AUTOCOMPLETE_OTHERS])
            ? ''
            : (
                is_string($values[self::FIELD_AUTOCOMPLETE_OTHERS])
                ? $values[self::FIELD_AUTOCOMPLETE_OTHERS]
                : (
                    is_array($values[self::FIELD_AUTOCOMPLETE_OTHERS])
                    ? implode('|', $values[self::FIELD_AUTOCOMPLETE_OTHERS])
                    : ''
                )
            );
        $data = array_map('trim', explode('|', $autocompleteFieldnames));
        $street = empty($data[0]) ? self::DEFAULT_FIELDNAME_STREET : $data[0];
        $street1 = empty($data[1]) ? self::DEFAULT_FIELDNAME_STREET1 : $data[1];
        $street2 = empty($data[2]) ? self::DEFAULT_FIELDNAME_STREET2 : $data[2];
        $county = empty($data[3]) ? self::DEFAULT_FIELDNAME_COUNTY : $data[3];
        $state = empty($data[4]) ? self::DEFAULT_FIELDNAME_STATE : $data[4];

        $this->autocompleteFieldnames = compact(['postalCode','town','street','street1','street2','county','state']);
    }

    protected function renderInput($entry)
    {
        $value = $this->getValue($entry);
        $params = $this->getService(ParameterBagInterface::class);

        $mapProvider= $params->get('baz_provider');
        $mapProviderId = $params->get('baz_provider_id');
        $mapProviderPass = $params->get('baz_provider_pass');
        if (!empty($mapProviderId) && !empty($mapProviderPass)) {
            if ($mapProvider == 'MapBox') {
                $mapProviderCredentials = [
                    'id' => $mapProviderId,
                    'accessToken' => $mapProviderPass
                ];
            } else {
                $mapProviderCredentials = [
                    'app_id' => $mapProviderId,
                    'app_code' => $mapProviderPass
                ];
            }
        } else {
            $mapProviderCredentials = null;
        }

        $latitude = is_array($value) && !empty($value[$this->getLatitudeField()]) ? $value[$this->getLatitudeField()] : null;
        $longitude = is_array($value) && !empty($value[$this->getLongitudeField()]) ? $value[$this->getLongitudeField()] : null;

        return $this->render("@bazar/inputs/map.twig", [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'mapFieldData' => [
                'bazWheelZoom' => $params->get('baz_wheel_zoom'),
                'bazShowNav' => $params->get('baz_show_nav'),
                'bazMapCenterLat' => $params->get('baz_map_center_lat'),
                'bazMapCenterLon' => $params->get('baz_map_center_lon'),
                'bazMapZoom' => $params->get('baz_map_zoom'),
                'mapProvider' => $mapProvider,
                'mapProviderCredentials' => $mapProviderCredentials,
                'latitude' => $latitude,
                'longitude' => $longitude
            ]
        ]);
    }

    // GETTERS. Needed to use them in the Twig syntax

    public function getAutocompleteFieldnames()
    {
        return $this->autocompleteFieldnames;
    }

    // change return of this method to keep compatible with php 7.3 (mixed is not managed)
    #[\ReturnTypeWillChange]
    public function jsonSerialize()
    {
        return array_merge(
            parent::jsonSerialize(),
            [
                'autocompleteFieldnames' => $this->getAutocompleteFieldnames(),
            ]
        );
    }
}
