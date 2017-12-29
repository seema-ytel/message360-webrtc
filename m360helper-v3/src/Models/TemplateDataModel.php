<?php
/*
 * Message360
 *
 * This file was automatically generated for message360 by APIMATIC v2.0 ( https://apimatic.io ).
 */

namespace Message360Lib\Models;

use JsonSerializable;

/**
 * @todo Write general description for this model
 */
class TemplateDataModel implements JsonSerializable
{
    /**
     * @todo Write general description for this property
     * @required
     * @var string $companyname public property
     */
    public $companyname;

    /**
     * @todo Write general description for this property
     * @required
     * @var string $otpcode public property
     */
    public $otpcode;

    /**
     * Constructor to set initial or default values of member properties
     * @param string $companyname Initialization value for $this->companyname
     * @param string $otpcode     Initialization value for $this->otpcode
     */
    public function __construct()
    {
        if (2 == func_num_args()) {
            $this->companyname = func_get_arg(0);
            $this->otpcode     = func_get_arg(1);
        }
    }


    /**
     * Encode this object to JSON
     */
    public function jsonSerialize()
    {
        $json = array();
        $json['companyname'] = $this->companyname;
        $json['otpcode']     = $this->otpcode;

        return $json;
    }
}
