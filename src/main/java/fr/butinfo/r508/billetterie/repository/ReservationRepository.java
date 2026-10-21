package fr.butinfo.r508.billetterie.repository;

import fr.butinfo.r508.billetterie.domain.Reservation;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByCode(String code);

    boolean existsByCode(String code);

    @Query("""
            select coalesce(sum(r.nombrePlaces), 0)
            from Reservation r
            where r.seance.id = :seanceId and r.statut = :statut
            """)
    Long sommePlaces(@Param("seanceId") Long seanceId, @Param("statut") StatutReservation statut);

    @Query("""
            select r.seance.id, coalesce(sum(r.nombrePlaces), 0)
            from Reservation r
            where r.seance.id in :seanceIds and r.statut = :statut
            group by r.seance.id
            """)
    List<Object[]> sommePlacesParSeance(@Param("seanceIds") Collection<Long> seanceIds,
                                        @Param("statut") StatutReservation statut);
}
