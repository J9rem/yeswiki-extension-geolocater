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

use Psr\Container\ContainerInterface;
use YesWiki\Bazar\Field\MapField as BazarMapField;

/**
 * @Field({"map", "carte_google"})
 */
class MapField extends BazarMapField
{
}
