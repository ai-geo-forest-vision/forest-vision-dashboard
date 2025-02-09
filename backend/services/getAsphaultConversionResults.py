from schemas.species import SPECIES_DATA


def plan_asphalt_conversion(
    asphalt_sqft: float,
    species_distribution: dict,
    species_data: dict = SPECIES_DATA,
    spacing_sqft_per_tree: float = 100.0,
    cost_removal_per_sqft: float = 10.0,
    maintenance_years: int = 5
):
    """
    Estimate costs and carbon reduction for converting asphalt into a tree-planted area.

    :param asphalt_sqft: Total square feet of asphalt to remove.
    :param species_distribution: A dict of {species_name: fraction}, summing to 1.0.
                                e.g. {"oak": 0.5, "maple": 0.3, "pine": 0.2}
    :param species_data: A dict with per-species stats, e.g.:
                         {
                           "oak": {
                               "planting_cost": 300,           # $ per tree
                               "annual_maintenance_cost": 50,  # $/year/tree
                               "annual_co2_kg": 20             # kg CO2 / year / tree
                           },
                           "maple": {...},
                           ...
                         }
    :param spacing_sqft_per_tree: How many square feet are allocated per tree.
    :param cost_removal_per_sqft: Cost to remove asphalt per square foot.
    :param maintenance_years: How many years of maintenance (and CO₂ reduction) to account for.
    :return: A dictionary with:
             {
               "asphalt_removal_cost": float,
               "trees_planted_per_species": dict,
               "total_maintenance_cost": float,
               "total_co2_reduction_kg": float
             }
    """

    # 1) Cost to remove the asphalt
    asphalt_removal_cost = asphalt_sqft * cost_removal_per_sqft

    # 2) Total number of trees we can plant, ignoring partial trees
    total_tree_capacity = int(asphalt_sqft // spacing_sqft_per_tree)

    # Prepare outputs
    trees_planted_per_species = {}
    total_maintenance_cost = 0.0
    total_co2_reduction = 0.0

    # 3) For each species in the distribution, calculate breakdown
    for species, fraction in species_distribution.items():
        if species not in species_data:
            # If we don't have data for a species, skip or treat as zero
            trees_planted_per_species[species] = 0
            continue

        # Number of trees for this species
        species_trees = int(total_tree_capacity * fraction)

        # Maintenance cost for the entire period
        annual_maint_cost = species_data[species]["maintenance_cost"]
        maintenance_cost_species = species_trees * annual_maint_cost * maintenance_years

        # CO2 reduction over the entire period (simple multiplication approach)
        # If each tree sequesters 'co2_per_year' per year,
        # total is (co2_per_year * years * number_of_trees).
        co2_annual = species_data[species]["co2_per_year"]
        co2_reduction_species = co2_annual * maintenance_years * species_trees

        # Accumulate
        trees_planted_per_species[species] = species_trees
        total_maintenance_cost += maintenance_cost_species
        total_co2_reduction += co2_reduction_species

    result = {
        "asphalt_removal_cost": asphalt_removal_cost,
        "trees_planted_per_species": trees_planted_per_species,
        "total_maintenance_cost": total_maintenance_cost,
        "total_co2_reduction_kg": total_co2_reduction
    }

    return result


# if __name__ == "__main__":
#     # Suppose we remove 50,000 sq ft of asphalt
#     asphalt_area = 50_000

#     # Distribution of species (they must sum to 1.0)
#     distribution = {
#         "coast_live_oak": 0.5,
#         "monterey_pine": 0.3,
#         "redwood": 0.2
#     }

#     # Spacing assumption: 100 sq ft per tree
#     # Cost to remove asphalt: $10/sq ft
#     # Maintenance horizon: 5 years
#     result_data = plan_asphalt_conversion(
#         asphalt_sqft=asphalt_area,
#         species_distribution=distribution,
#         spacing_sqft_per_tree=100,
#         cost_removal_per_sqft=10,
#         maintenance_years=5
#     )

#     print("RESULTS:")
#     print(f"  Asphalt Removal Cost: ${result_data['asphalt_removal_cost']:,.2f}")
#     print(f"  Trees Planted by Species: {result_data['trees_planted_per_species']}")
#     print(f"  Total Maintenance Cost (5 yrs): ${result_data['total_maintenance_cost']:,.2f}")
#     print(f"  Total CO₂ Reduction (5 yrs): {result_data['total_co2_reduction_kg']:,.2f} kg")