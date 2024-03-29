// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

contract UnitrollerAdminStorage {
    /**
     * @notice Administrator for this contract
     */
    address public admin;

    /**
     * @notice Pending administrator for this contract
     */
    address public pendingAdmin;

    /**
     * @notice Active brains of Unitroller
     */
    address public avatrollerImplementation;

    /**
     * @notice Pending brains of Unitroller
     */
    address public pendingAvatrollerImplementation;
}
